import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  resumeUrl: {
    type: String
  },
  coverLetter: {
    type: String
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate applications
applicationSchema.index({ studentId: 1, companyId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
