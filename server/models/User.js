import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    enum: ['student', 'placement_officer', 'admin'],
    default: 'student'
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

const User = mongoose.model('User', userSchema);

export default User;
