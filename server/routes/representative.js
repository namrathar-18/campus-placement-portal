import express from 'express';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/representative/dashboard-stats
// @desc    Get dashboard statistics for representative
// @access  Private (Student Representative only)
router.get('/dashboard-stats', protect, authorize('student_representative'), async (req, res) => {
  try {
    const repDepartment = req.user.department;
    
    // Get students from same department
    const departmentStudents = await User.find({ 
      role: 'student',
      department: repDepartment
    });
    
    const studentIds = departmentStudents.map(s => s._id);
    
    // Get applications statistics
    const totalApplications = await Application.countDocuments({ 
      studentId: { $in: studentIds } 
    });
    
    const pendingApplications = await Application.countDocuments({ 
      studentId: { $in: studentIds },
      status: 'pending' 
    });
    
    const placedApplications = await Application.countDocuments({ 
      studentId: { $in: studentIds },
      status: 'placed' 
    });
    
    // Get placed students
    const placedStudents = await User.countDocuments({ 
      _id: { $in: studentIds },
      isPlaced: true 
    });
    
    // Get active companies
    const activeCompanies = await Company.countDocuments({ status: 'active' });
    
    // Get recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalStudents: departmentStudents.length,
        placedStudents,
        unplacedStudents: departmentStudents.length - placedStudents,
        totalApplications,
        pendingApplications,
        placedApplications,
        activeCompanies,
        recentNotifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/representative/students
// @desc    Get all students in representative's department
// @access  Private (Student Representative only)
router.get('/students', protect, authorize('student_representative'), async (req, res) => {
  try {
    const { department, search, placementStatus } = req.query;
    const repDepartment = department || req.user.department;
    
    let query = { 
      role: 'student',
      department: repDepartment 
    };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add placement status filter
    if (placementStatus === 'placed') {
      query.isPlaced = true;
    } else if (placementStatus === 'unplaced') {
      query.isPlaced = false;
    }
    
    const students = await User.find(query)
      .select('-password')
      .sort({ registerNumber: 1 });
    
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/representative/applications
// @desc    Get all applications from representative's department
// @access  Private (Student Representative only)
router.get('/applications', protect, authorize('student_representative'), async (req, res) => {
  try {
    const { status, companyId } = req.query;
    const repDepartment = req.user.department;
    
    // Get students from same department
    const departmentStudents = await User.find({ 
      role: 'student',
      department: repDepartment
    }).select('_id');
    
    const studentIds = departmentStudents.map(s => s._id);
    
    let query = { studentId: { $in: studentIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    const applications = await Application.find(query)
      .populate('studentId', 'name registerNumber email department gpa')
      .populate('companyId', 'name location package deadline')
      .sort({ appliedDate: -1 });
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/representative/student/:id
// @desc    Get detailed student information
// @access  Private (Student Representative only)
router.get('/student/:id', protect, authorize('student_representative'), async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      department: req.user.department
    }).select('-password');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found or not in your department' 
      });
    }
    
    // Get student's applications
    const applications = await Application.find({ studentId: student._id })
      .populate('companyId', 'name location package deadline status')
      .sort({ appliedDate: -1 });
    
    res.json({
      success: true,
      data: {
        student,
        applications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/representative/send-reminder
// @desc    Send reminder notification to students
// @access  Private (Student Representative only)
router.post('/send-reminder', protect, authorize('student_representative'), async (req, res) => {
  try {
    const { studentIds, title, message, type } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    // Verify students are in representative's department
    const students = await User.find({
      _id: { $in: studentIds },
      department: req.user.department,
      role: 'student'
    });
    
    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid students found in your department'
      });
    }
    
    // Create notifications for each student
    const notifications = students.map(student => ({
      userId: student._id,
      title,
      message,
      type: type || 'info',
      sentBy: req.user._id,
      sentByName: req.user.name
    }));
    
    await Notification.insertMany(notifications);
    
    res.json({
      success: true,
      message: `Reminder sent to ${students.length} student(s)`,
      data: { count: students.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/representative/placement-report
// @desc    Generate placement report for department
// @access  Private (Student Representative only)
router.get('/placement-report', protect, authorize('student_representative'), async (req, res) => {
  try {
    const repDepartment = req.user.department;
    
    // Get all students
    const allStudents = await User.find({ 
      role: 'student',
      department: repDepartment
    }).select('name registerNumber isPlaced gpa');
    
    // Get placed students with company details
    const placedStudents = await User.find({ 
      role: 'student',
      department: repDepartment,
      isPlaced: true
    }).select('name registerNumber gpa');
    
    const placedIds = placedStudents.map(s => s._id);
    
    // Get placed applications for placed students
    const placedApplications = await Application.find({
      studentId: { $in: placedIds },
      status: 'placed'
    }).populate('companyId', 'name package location');
    
    // Calculate statistics
    const totalStudents = allStudents.length;
    const placedCount = placedStudents.length;
    const placementPercentage = totalStudents > 0 
      ? ((placedCount / totalStudents) * 100).toFixed(2) 
      : 0;
    
    // Get company-wise placements
    const companyWisePlacements = {};
    placedApplications.forEach(app => {
      if (app.companyId) {
        const companyName = app.companyId.name;
        if (!companyWisePlacements[companyName]) {
          companyWisePlacements[companyName] = {
            count: 0,
            package: app.companyId.package,
            location: app.companyId.location
          };
        }
        companyWisePlacements[companyName].count++;
      }
    });
    
    res.json({
      success: true,
      data: {
        department: repDepartment,
        totalStudents,
        placedStudents: placedCount,
        unplacedStudents: totalStudents - placedCount,
        placementPercentage,
        companyWisePlacements,
        studentsList: allStudents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/representative/companies-deadline
// @desc    Get companies with upcoming deadlines
// @access  Private (Student Representative only)
router.get('/companies-deadline', protect, authorize('student_representative'), async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const companies = await Company.find({
      status: 'active',
      deadline: {
        $gte: today,
        $lte: nextWeek
      }
    }).sort({ deadline: 1 });
    
    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/representative/update-student-status
// @desc    Update student placement status (helper function)
// @access  Private (Student Representative only)
router.post('/update-student-status', protect, authorize('student_representative'), async (req, res) => {
  try {
    const { studentId, isPlaced } = req.body;
    
    const student = await User.findOne({
      _id: studentId,
      department: req.user.department,
      role: 'student'
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or not in your department'
      });
    }
    
    student.isPlaced = isPlaced;
    await student.save();
    
    res.json({
      success: true,
      message: `Student placement status updated to ${isPlaced ? 'placed' : 'unplaced'}`,
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
