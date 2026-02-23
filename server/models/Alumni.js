import mongoose from 'mongoose';

const normalizeCompany = (value = '') => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
};

const alumniSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    currentCompany: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedCompany: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    linkedin: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

alumniSchema.pre('validate', function(next) {
  this.normalizedCompany = normalizeCompany(this.currentCompany || '');
  next();
});

alumniSchema.index({ currentCompany: 'text' });

const Alumni = mongoose.model('Alumni', alumniSchema);

export default Alumni;
