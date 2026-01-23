import express from 'express';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stats
// @desc    Get placement statistics
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'student') {
      // Student stats
      const applications = await Application.find({ studentId: req.user._id });
      stats.totalApplications = applications.length;
      stats.pendingApplications = applications.filter(app => app.status === 'pending').length;
      stats.approvedApplications = applications.filter(app => app.status === 'approved').length;
      stats.rejectedApplications = applications.filter(app => app.status === 'rejected').length;
      
      const companies = await Company.countDocuments({ status: 'active' });
      stats.activeCompanies = companies;
    } else {
      // Officer/Admin stats
      stats.totalCompanies = await Company.countDocuments();
      stats.activeCompanies = await Company.countDocuments({ status: 'active' });
      stats.totalStudents = await User.countDocuments({ role: 'student' });
      stats.placedStudents = await User.countDocuments({ role: 'student', isPlaced: true });
      stats.totalApplications = await Application.countDocuments();
      stats.pendingApplications = await Application.countDocuments({ status: 'pending' });
      stats.approvedApplications = await Application.countDocuments({ status: 'approved' });
      
      // Calculate placement rate
      stats.placementRate = stats.totalStudents > 0 
        ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(2) 
        : 0;
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
