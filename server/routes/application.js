import express from 'express';
import Application from '../models/Application.js';
import User from '../models/User.js';
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
      .populate('studentId', 'name email registerNumber department isPlaced')
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
      .populate('studentId', 'name email registerNumber department isPlaced')
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
    // Check if student is already placed
    const student = await User.findById(req.user._id);
    const hasPlacedApplication = await Application.exists({
      studentId: req.user._id,
      status: 'placed',
    });

    if (student.isPlaced || hasPlacedApplication) {
      if (!student.isPlaced) {
        await User.findByIdAndUpdate(req.user._id, { isPlaced: true });
      }

      return res.status(400).json({ 
        success: false, 
        message: 'You are already placed and cannot apply to other companies' 
      });
    }

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

    // Only block if trying to mark as 'placed' when student is already placed at a different company
    if (
      (req.user.role === 'placement_officer' || req.user.role === 'student_representative') &&
      req.body.status === 'placed'
    ) {
      const alreadyPlaced = await Application.findOne({
        studentId: application.studentId,
        status: 'placed',
        _id: { $ne: req.params.id },
      });
      if (alreadyPlaced) {
        return res.status(400).json({
          success: false,
          message: 'Student is already placed in another company.',
        });
      }
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('studentId', 'name email registerNumber department')
    .populate('companyId', 'name package location deadline');

    // If status changed to placed, mark student as placed and remove all other applications
    if (req.body.status === 'placed' && application.status !== 'placed') {
      await User.findByIdAndUpdate(application.studentId, { isPlaced: true });
      
      // Keep only the placed application for this student
      await Application.deleteMany(
        { 
          studentId: application.studentId, 
          _id: { $ne: req.params.id }
        }
      );
    }

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
