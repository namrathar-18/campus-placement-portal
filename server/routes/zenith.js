import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import pdfParse from 'pdf-parse';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resumeAnalyzerScriptPath = path.join(__dirname, '../ml/resume_analyzer.py');
const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';

const unavailableMessage = "I don't have access to that information. Please contact Placement Cell.";

const sanitizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>$]/g, '').trim();
};

const normalizeArrayInput = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim());
  }

  return [];
};

const sanitizeStringArray = (value) => {
  return normalizeArrayInput(value)
    .map((item) => sanitizeText(item))
    .filter((item) => item.length > 0)
    .slice(0, 50);
};

const runPythonResumeAnalyzer = (payload) =>
  new Promise((resolve, reject) => {
    const py = spawn(pythonExecutable, [resumeAnalyzerScriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      py.kill();
      reject(new Error('Resume analyzer timed out'));
    }, 60000);

    py.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });

    py.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    py.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start Python analyzer: ${error.message}`));
    });

    py.on('close', (code) => {
      clearTimeout(timeout);

      let parsed;
      try {
        parsed = JSON.parse(stdout || '{}');
      } catch {
        parsed = null;
      }

      if (code !== 0 || !parsed?.success) {
        const message = parsed?.error || stderr.trim() || 'Python resume analyzer failed';
        reject(new Error(message));
        return;
      }

      resolve(parsed.data);
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });

const extractPdfTextFromDataUrl = async (resumeUrl) => {
  if (typeof resumeUrl !== 'string' || !resumeUrl.startsWith('data:application/pdf')) {
    return '';
  }

  const base64Data = resumeUrl.split(',')[1];
  if (!base64Data) {
    return '';
  }

  try {
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    if (!pdfBuffer.length) {
      return '';
    }

    const parsed = await pdfParse(pdfBuffer);
    console.log('PDF Extracted Text:', parsed?.text?.slice(0, 500)); // Log first 500 chars
    return sanitizeText(parsed?.text || '');
  } catch (err) {
    console.error('PDF Parse Error:', err);
    return '';
  }
};

const buildStudentProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  isPlaced: !!user.isPlaced,
  registerNumber: user.registerNumber,
  phone: user.phone,
  department: user.department,
  section: user.section,
  gpa: user.gpa,
  gpaLocked: !!user.gpaLocked,
  skills: user.skills || [],
  certifications: user.certifications || [],
  projects: user.projects || [],
  resumeText: user.resumeText || '',
});

// @route   GET /api/zenith/profile
// @desc    Get logged-in student profile for Zenith
// @access  Private/Student
router.get('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email isPlaced registerNumber phone department section gpa gpaLocked skills certifications projects resumeText'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: unavailableMessage });
    }

    return res.json({ success: true, data: buildStudentProfile(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/zenith/profile
// @desc    Update allowed fields in logged-in student profile for Zenith
// @access  Private/Student
router.patch('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const allowedFields = new Set([
      'phone',
      'department',
      'section',
      'registerNumber',
      'skills',
      'certifications',
      'projects',
      'resumeText',
      'gpa',
    ]);

    const updateData = {};

    Object.keys(req.body || {}).forEach((key) => {
      if (allowedFields.has(key)) {
        updateData[key] = req.body[key];
      }
    });

    if ('phone' in updateData) {
      const cleanPhone = sanitizeText(updateData.phone);
      if (cleanPhone && !/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
      }
      updateData.phone = cleanPhone;
    }

    if ('department' in updateData) {
      updateData.department = sanitizeText(updateData.department);
    }

    if ('section' in updateData) {
      updateData.section = sanitizeText(updateData.section);
    }

    if ('registerNumber' in updateData) {
      updateData.registerNumber = sanitizeText(updateData.registerNumber).toUpperCase();
    }

    if ('resumeText' in updateData) {
      updateData.resumeText = sanitizeText(updateData.resumeText).slice(0, 20000);
    }

    if ('skills' in updateData) {
      updateData.skills = sanitizeStringArray(updateData.skills);
    }

    if ('certifications' in updateData) {
      updateData.certifications = sanitizeStringArray(updateData.certifications);
    }

    if ('projects' in updateData) {
      updateData.projects = sanitizeStringArray(updateData.projects);
    }

    if ('gpa' in updateData) {
      const currentUser = await User.findById(req.user._id).select('gpaLocked');
      if (!currentUser) {
        return res.status(404).json({ success: false, message: unavailableMessage });
      }
      if (currentUser.gpaLocked) {
        return res.status(403).json({ success: false, message: 'CGPA is locked by admin and cannot be edited.' });
      }

      const parsedGpa = Number(updateData.gpa);
      if (Number.isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 10) {
        return res.status(400).json({ success: false, message: 'Invalid GPA value' });
      }
      updateData.gpa = parsedGpa;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('name email isPlaced registerNumber phone department section gpa gpaLocked skills certifications projects resumeText');

    return res.json({ success: true, data: buildStudentProfile(updatedUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

const tokenize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const buildCompanySearchCorpus = (company) =>
  [
    company.name,
    company.description,
    company.eligibility,
    company.role,
    ...(company.roles || []),
    ...(company.requirements || []),
  ]
    .join(' ')
    .toLowerCase();

// @route   GET /api/zenith/recommendations
// @desc    Get top 3 company recommendations for logged-in student
// @access  Private/Student
router.get('/recommendations', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('department gpa skills certifications projects');
    if (!user) {
      return res.status(404).json({ success: false, message: unavailableMessage });
    }

    const companies = await Company.find({ status: 'active', deadline: { $gte: new Date() } }).select(
      'name min_gpa package salary role roles requirements eligibility deadline description job_type'
    );

    const studentSkills = (user.skills || []).map((skill) => String(skill).toLowerCase());
    const studentSkillSet = new Set(studentSkills);
    const studentDepartment = String(user.department || '').toLowerCase();
    const studentGpa = Number(user.gpa || 0);

    const ranked = companies.map((company) => {
      const requirementTokens = new Set(tokenize((company.requirements || []).join(' ')));
      const matchedSkills = studentSkills.filter((skill) => requirementTokens.has(skill));
      const skillMatchPercent = requirementTokens.size
        ? Math.round((matchedSkills.length / requirementTokens.size) * 100)
        : studentSkillSet.size
        ? 40
        : 0;

      const gpaEligible = studentGpa >= Number(company.min_gpa || 0);
      const gpaScore = gpaEligible ? 25 : 0;

      const corpus = buildCompanySearchCorpus(company);
      const branchMatch = studentDepartment ? corpus.includes(studentDepartment) : false;
      const branchScore = branchMatch ? 10 : 0;

      const certProjectBoost = (user.certifications?.length || 0) + (user.projects?.length || 0) > 0 ? 5 : 0;
      const overallScore = Math.min(100, skillMatchPercent + gpaScore + branchScore + certProjectBoost);

      return {
        companyId: company._id,
        name: company.name,
        role: company.role || company.roles?.[0] || 'N/A',
        package: company.package,
        salary: company.salary,
        minGpa: company.min_gpa,
        deadline: company.deadline,
        skillMatchPercent,
        gpaEligible,
        branchMatch,
        overallScore,
        reasons: [
          `Skill match: ${skillMatchPercent}%`,
          `CGPA eligibility: ${gpaEligible ? `Eligible (your CGPA ${studentGpa} ≥ ${company.min_gpa || 0})` : `Not eligible (minimum CGPA ${company.min_gpa || 0})`}`,
          `Branch alignment: ${branchMatch ? 'Matched with company criteria' : 'Not explicitly mentioned'}`,
        ],
      };
    });

    const top3 = ranked
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3);

    return res.json({ success: true, data: top3 });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/zenith/upcoming-drives
// @desc    Get upcoming active drives for logged-in student
// @access  Private/Student
router.get('/upcoming-drives', protect, authorize('student'), async (req, res) => {
  try {
    const companies = await Company.find({ status: 'active', deadline: { $gte: new Date() } })
      .select('name role roles deadline min_gpa package salary')
      .sort({ deadline: 1 })
      .limit(5);

    const data = companies.map((company) => ({
      companyId: company._id,
      name: company.name,
      role: company.role || company.roles?.[0] || 'N/A',
      deadline: company.deadline,
      minGpa: company.min_gpa,
      package: company.package,
      salary: company.salary,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/zenith/resume-feedback
// @desc    Generate resume feedback for logged-in student
// @access  Private/Student
router.post('/resume-feedback', protect, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('resumeText resumeUrl skills projects certifications');
    if (!user) {
      return res.status(404).json({ success: false, message: unavailableMessage });
    }

    const providedText = typeof req.body?.resumeText === 'string' ? req.body.resumeText : '';
    let resumeText = sanitizeText(providedText || user.resumeText || '');

    if (!resumeText) {
      const extractedFromPdf = await extractPdfTextFromDataUrl(user.resumeUrl);
      if (extractedFromPdf) {
        resumeText = extractedFromPdf;

        // Cache extracted text to speed up future feedback requests.
        if (!user.resumeText) {
          await User.findByIdAndUpdate(req.user._id, { resumeText: extractedFromPdf.slice(0, 20000) });
        }
      }
    }

    if (!resumeText) {
      return res.status(404).json({
        success: false,
        message: 'Resume text is not available. Upload a readable PDF resume in profile or add resume text.',
      });
    }

    const recommendedKeywords = [
      'problem solving',
      'data structures',
      'algorithms',
      'react',
      'node.js',
      'sql',
      'communication',
      'internship',
      'leadership',
      'projects',
    ];

    const lowerResume = resumeText.toLowerCase();
    const missingKeywords = recommendedKeywords.filter((keyword) => !lowerResume.includes(keyword)).slice(0, 6);

    const improvements = [
      'Use strong action verbs and quantified outcomes for each project bullet.',
      'Place technical skills near the top with tools grouped by category.',
      'Add role-specific keywords from target job descriptions for ATS matching.',
      'Keep formatting consistent and maintain one-page focus for fresher roles.',
    ];

    if (!user.projects?.length) {
      improvements.unshift('Add at least 2 academic or personal projects with measurable impact.');
    }

    if (!user.certifications?.length) {
      improvements.unshift('Include relevant certifications to strengthen profile credibility.');
    }

    return res.json({
      success: true,
      data: {
        missingKeywords,
        improvements: improvements.slice(0, 5),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/zenith/resume-analyzer
// @desc    Compare resume skills against job description using Python ML analyzer
// @access  Private/Student
router.post('/resume-analyzer', protect, authorize('student'), async (req, res) => {
  try {
    const jobDescription = sanitizeText(req.body?.jobDescription || '').slice(0, 15000);
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'jobDescription is required' });
    }

    const user = await User.findById(req.user._id).select('resumeText resumeUrl');
    if (!user) {
      return res.status(404).json({ success: false, message: unavailableMessage });
    }

    const resumeFileDataUrl = typeof req.body?.resumeFileDataUrl === 'string' ? req.body.resumeFileDataUrl : '';
    let uploadedResumeText = '';

    if (resumeFileDataUrl) {
      uploadedResumeText = await extractPdfTextFromDataUrl(resumeFileDataUrl);
      if (!uploadedResumeText) {
        return res.status(400).json({
          success: false,
          message: 'Uploaded resume could not be parsed. Please upload a readable PDF resume.',
        });
      }
    }

    const providedResumeText = sanitizeText(req.body?.resumeText || '').slice(0, 20000);
    let resumeText = providedResumeText || uploadedResumeText || sanitizeText(user.resumeText || '');

    if (!resumeText) {
      const extractedFromPdf = await extractPdfTextFromDataUrl(user.resumeUrl);
      if (extractedFromPdf) {
        resumeText = extractedFromPdf;

        if (!user.resumeText) {
          await User.findByIdAndUpdate(req.user._id, { resumeText: extractedFromPdf.slice(0, 20000) });
        }
      }
    }

    if (!resumeText) {
      return res.status(404).json({
        success: false,
        message: 'Resume text is not available. Upload a readable PDF resume in profile or provide resumeText.',
      });
    }

    const topKMissing = Number(req.body?.topKMissing || 10);

    const analysis = await runPythonResumeAnalyzer({
      resume_text: resumeText,
      job_description: jobDescription,
      top_k_missing: Number.isFinite(topKMissing) ? topKMissing : 10,
    });

    return res.json({ success: true, data: analysis });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to run resume analyzer. Ensure Python and ML dependencies are installed on the server.',
    });
  }
});

export default router;
