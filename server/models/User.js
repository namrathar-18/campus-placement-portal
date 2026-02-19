import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'student_representative', 'placement_officer', 'admin'],
    default: 'student'
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: function() {
      return this.role === 'student';
    }
  },
  registerNumber: {
    type: String,
    sparse: true
  },
  phone: {
    type: String
  },
  department: {
    type: String
  },
  section: {
    type: String
  },
  gpa: {
    type: Number,
    min: 0,
    max: 10
  },
  resumeUrl: {
    type: String
  },
  photoUrl: {
    type: String
  },
  isPlaced: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token (6-digit code)
userSchema.methods.getResetPasswordToken = function() {
  // Generate 6-digit code
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
