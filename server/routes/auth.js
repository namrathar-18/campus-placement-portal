import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../config/email.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, gender } = req.body;

    // Validate student email domain
    const userRole = role || 'student';
    const normalizedGender = typeof gender === 'string' ? gender.toLowerCase().trim() : '';
    if (userRole === 'student' && !email.endsWith('@mca.christuniversity.in')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Students must register with @mca.christuniversity.in email address' 
      });
    }
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: userRole,
      gender: userRole === 'student' && ['male', 'female'].includes(normalizedGender) ? normalizedGender : undefined
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    // Validate student email domain on login
    if (user && user.role === 'student' && !email.endsWith('@mca.christuniversity.in')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Students must login with @mca.christuniversity.in email address' 
      });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          registerNumber: user.registerNumber,
          phone: user.phone,
          department: user.department,
          section: user.section,
          gpa: user.gpa,
          resumeUrl: user.resumeUrl,
          photoUrl: user.photoUrl,
          isPlaced: user.isPlaced,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        registerNumber: user.registerNumber,
        phone: user.phone,
        department: user.department,
        section: user.section,
        gpa: user.gpa,
        resumeUrl: user.resumeUrl,
        photoUrl: user.photoUrl,
        isPlaced: user.isPlaced,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  try {
    // Clear any server-side session data if needed
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset code to email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with that email address' 
      });
    }

    // Get reset token (6-digit code)
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Send email with reset code
    try {
      const emailResult = await sendPasswordResetEmail(email, resetToken);
      
      res.json({
        success: true,
        message: 'Password reset code sent to email',
        // Only send code in response if email service is not configured (dev mode)
        devCode: emailResult.devMode ? resetToken : undefined
      });
    } catch (emailError) {
      // If email fails, clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      throw new Error('Error sending email. Please try again later.');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using code
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, code, and new password' 
      });
    }

    // Hash the provided code to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset code' 
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
