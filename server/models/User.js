import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
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
    enum: ['male', 'female']
  },
  isRepresentative: {
    type: Boolean,
    default: false
  },
  representativeDesignation: {
    type: String,
    enum: ['class_representative', 'department_representative', 'placement_coordinator'],
    sparse: true
  },
  registerNumber: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  phone: {
    type: String
  },
  department: {
    type: String
  },
  section: {
    type: String,
    enum: ['A', 'B', 'AI/ML', 'MSc AI/ML']
  },
  gpa: {
    type: Number,
    min: 0,
    max: 10
  },
  gpaLocked: {
    type: Boolean,
    default: false
  },
  skills: {
    type: [String],
    default: []
  },
  certifications: {
    type: [String],
    default: []
  },
  projects: {
    type: [String],
    default: []
  },
  resumeText: {
    type: String,
    default: ''
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
  // ...existing code...
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

// ...existing code...

const User = mongoose.model('User', userSchema);

export default User;
