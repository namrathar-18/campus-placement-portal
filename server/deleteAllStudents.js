// Script to delete all student records from the database
// Usage: node deleteAllStudents.js

import mongoose from 'mongoose';
import User from './models/User.js';

async function deleteAllStudents() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal');

  const result = await User.deleteMany({ role: 'student' });
  console.log(`Deleted ${result.deletedCount} student records.`);

  await mongoose.disconnect();
}

deleteAllStudents().catch(err => {
  console.error('Delete failed:', err);
  process.exit(1);
});
