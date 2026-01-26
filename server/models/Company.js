import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  logoUrl: {
    type: String
  },
  industry: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  package: {
    type: Number,
    required: false
  },
  salary: {
    type: String
  },
  min_gpa: {
    type: Number,
    default: 0
  },
  eligibility: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    default: ''
  },
  roles: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  job_type: {
    type: String,
    enum: ['full-time', 'internship', 'both'],
    default: 'full-time'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  openings: {
    type: Number,
    default: 0
  },
  // Base64-encoded PDF details file
  detailsFile: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;
