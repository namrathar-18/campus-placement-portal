import express from 'express';
import Company from '../models/Company.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ deadline: 1 });
    res.json({ success: true, data: companies });
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

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/companies
// @desc    Create a company
// @access  Private/Placement Officer
router.post('/', protect, authorize('placement_officer', 'admin'), async (req, res) => {
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

// @route   PUT /api/companies/:id
// @desc    Update a company
// @access  Private/Placement Officer
router.put('/:id', protect, authorize('placement_officer', 'admin'), async (req, res) => {
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
router.delete('/:id', protect, authorize('placement_officer', 'admin'), async (req, res) => {
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
