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
    enum: ['pending', 'placed', 'rejected', 'ongoing'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  resumeUrl: {
    type: String
  },
  CompanyDetails: {
    type: String
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications and speed up lookups
applicationSchema.index({ studentId: 1, companyId: 1 }, { unique: true });
// Supports fast status filtering on officer dashboards and analytics
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ status: 1, appliedDate: -1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
