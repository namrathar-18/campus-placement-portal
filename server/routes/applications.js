import express from 'express';
import Application from '../models/Application.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/applications
// @desc    Get applications (all for officers, only user's for students)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const applications = await Application.find(query)
      .populate('studentId', 'name email registerNumber department')
      .populate('companyId', 'name package location deadline')
      .sort({ appliedDate: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('studentId', 'name email registerNumber department')
      .populate('companyId', 'name package location deadline');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Students can only view their own applications
    if (req.user.role === 'student' && application.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/applications
// @desc    Create an application
// @access  Private/Student
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const application = await Application.create({
      ...req.body,
      studentId: req.user._id
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('studentId', 'name email registerNumber department')
      .populate('companyId', 'name package location deadline');

    res.status(201).json({ success: true, data: populatedApplication });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied to this company' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update an application (status change by officer, update by student)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Students can only update their own applications
    if (req.user.role === 'student' && application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('studentId', 'name email registerNumber department')
    .populate('companyId', 'name package location deadline');

    res.json({ success: true, data: updatedApplication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete an application
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Students can only delete their own applications
    if (req.user.role === 'student' && application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
