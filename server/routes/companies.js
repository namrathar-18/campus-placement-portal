import express from 'express';
import Company from '../models/Company.js';
import { protect, authorize } from '../middleware/auth.js';
import { defaultCompanies } from '../data/defaultCompanies.js';

const router = express.Router();

const defaultCompanyUrlByName = new Map(
  defaultCompanies
    .filter((company) => company?.name && company?.websiteUrl)
    .map((company) => [company.name, company.websiteUrl]),
);

const withFallbackWebsiteUrl = (company) => {
  const plain = typeof company?.toObject === 'function' ? company.toObject() : company;
  const fallbackUrl = defaultCompanyUrlByName.get(plain?.name) || '';
  const currentUrl = (plain?.websiteUrl || '').trim();

  return {
    ...plain,
    websiteUrl: currentUrl || fallbackUrl,
  };
};

// @route   GET /api/companies
// @desc    Get all companies
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ deadline: 1 });

    const enrichedCompanies = companies.map(withFallbackWebsiteUrl);

    const missingUrlUpdates = enrichedCompanies
      .filter((company) => company?.websiteUrl && !(companies.find((doc) => String(doc._id) === String(company._id))?.websiteUrl || '').trim())
      .map((company) => ({
        updateOne: {
          filter: { _id: company._id },
          update: { $set: { websiteUrl: company.websiteUrl } },
        },
      }));

    if (missingUrlUpdates.length > 0) {
      await Company.bulkWrite(missingUrlUpdates, { ordered: false });
    }

    res.json({ success: true, data: enrichedCompanies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const enrichedCompany = withFallbackWebsiteUrl(company);

    if (enrichedCompany.websiteUrl && !(company.websiteUrl || '').trim()) {
      await Company.findByIdAndUpdate(company._id, { websiteUrl: enrichedCompany.websiteUrl });
    }

    res.json({ success: true, data: enrichedCompany });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/companies
// @desc    Create a company
// @access  Private/Placement Officer
router.post('/', protect, authorize('placement_officer', 'admin', 'student_representative'), async (req, res) => {
  try {
    const company = await Company.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/companies/bootstrap-defaults
// @desc    Upsert default companies for placement officer/admin
// @access  Private/Placement Officer
router.post('/bootstrap-defaults', protect, authorize('placement_officer', 'admin', 'student_representative'), async (req, res) => {
  try {
    const defaultCompanyNames = defaultCompanies.map((company) => company.name);

    const upsertOperations = defaultCompanies.map((company) => ({
      updateOne: {
        filter: { name: company.name },
        update: {
          $set: {
            description: company.description,
            industry: company.industry,
            location: company.location,
            websiteUrl: company.websiteUrl || '',
            salary: company.salary,
            min_gpa: company.min_gpa,
            eligibility: company.eligibility,
            deadline: company.deadline,
            role: company.role,
            roles: [company.role],
            requirements: company.requirements || [],
            detailsFile: company.detailsFile || '',
            job_type: company.job_type,
            status: company.status,
            openings: company.openings,
            createdBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    const result = await Company.bulkWrite(upsertOperations, { ordered: false });
    const deleteResult = await Company.deleteMany({ name: { $nin: defaultCompanyNames } });

    return res.json({
      success: true,
      message: 'Default companies synced to database successfully with exact canonical list.',
      data: {
        total: defaultCompanies.length,
        inserted: result.upsertedCount || 0,
        modified: result.modifiedCount || 0,
        matched: result.matchedCount || 0,
        removedExtra: deleteResult.deletedCount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update a company
// @access  Private/Placement Officer
router.put('/:id', protect, authorize('placement_officer', 'admin', 'student_representative'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete a company
// @access  Private/Placement Officer
router.delete('/:id', protect, authorize('placement_officer', 'admin', 'student_representative'), async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
