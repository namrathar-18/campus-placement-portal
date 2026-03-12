import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const validSections = new Set(['A', 'B', 'AI/ML', 'MSc AI/ML']);

const sanitizeText = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/[<>$]/g, '').trim();
};

const sanitizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeText(item))
    .filter((item) => typeof item === 'string' && item.length > 0)
    .slice(0, 50);
};

// @route   GET /api/users
// @desc    Get all users (for admin/officers/representatives)
// @access  Private/Officer/Representative
router.get('/', protect, authorize('placement_officer', 'student_representative', 'admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    // Users can only update their own profile unless they're an officer/admin
    if (req.user._id.toString() !== req.params.id && 
        req.user.role !== 'placement_officer' && 
        req.user.role !== 'student_representative' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Don't allow password updates through this route
    const { password, ...rawUpdateData } = req.body;

    const updateData = { ...rawUpdateData };
    const isSelfUpdate = req.user._id.toString() === req.params.id;
    const isStudentSelfUpdate = isSelfUpdate && req.user.role === 'student';

    if (isStudentSelfUpdate) {
      const allowedStudentFields = new Set([
        'phone',
        'department',
        'section',
        'registerNumber',
        'gender',
        'resumeUrl',
        'photoUrl',
        'resumeText',
        'skills',
        'certifications',
        'projects',
      ]);

      if (!req.user.gpaLocked) {
        allowedStudentFields.add('gpa');
      }

      Object.keys(updateData).forEach((key) => {
        if (!allowedStudentFields.has(key)) {
          delete updateData[key];
        }
      });

      if (typeof updateData.phone === 'string') {
        updateData.phone = sanitizeText(updateData.phone);
      }
      if (typeof updateData.department === 'string') {
        updateData.department = sanitizeText(updateData.department);
      }
      if (typeof updateData.section === 'string') {
        updateData.section = sanitizeText(updateData.section);
      }
      if (typeof updateData.registerNumber === 'string') {
        updateData.registerNumber = sanitizeText(updateData.registerNumber);
      }
      if (typeof updateData.gender === 'string') {
        const g = updateData.gender.toLowerCase();
        if (g !== 'male' && g !== 'female') {
          delete updateData.gender;
        } else {
          updateData.gender = g;
        }
      }
      if (typeof updateData.resumeText === 'string') {
        updateData.resumeText = sanitizeText(updateData.resumeText);
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
        const parsedGpa = Number(updateData.gpa);
        if (Number.isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 10) {
          return res.status(400).json({ success: false, message: 'Invalid GPA value' });
        }
        updateData.gpa = parsedGpa;
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'section')) {
      const sectionValue = typeof updateData.section === 'string' ? updateData.section.trim() : '';
      if (!validSections.has(sectionValue)) {
        return res.status(400).json({
          success: false,
          message: 'Section must be one of A, B, or AI/ML',
        });
      }
      updateData.section = sectionValue === 'MSc AI/ML' ? 'AI/ML' : sectionValue;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
