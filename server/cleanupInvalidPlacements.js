// Script to clean up 'placed' applications with missing/unknown company and update student status
// Usage: node cleanupInvalidPlacements.js (run in server directory with DB connection)

import mongoose from 'mongoose';
import Application from './models/Application.js';
import User from './models/User.js';
import Company from './models/Company.js';

async function cleanupInvalidPlacements() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal');

  // Find all placed applications with missing or unknown company
  const invalidApps = await Application.find({
    status: 'placed',
    $or: [
      { companyId: { $exists: false } },
      { companyId: null },
    ],
  });

  // Also check for companyId that does not exist in Company collection
  const appsWithCompany = await Application.find({ status: 'placed', companyId: { $ne: null } });
  const companyIds = (await Company.find({}, '_id')).map(c => String(c._id));
  const orphanedApps = appsWithCompany.filter(app => !companyIds.includes(String(app.companyId)));

  const allInvalidApps = [...invalidApps, ...orphanedApps];
  const affectedStudentIds = new Set(allInvalidApps.map(app => String(app.studentId)));

  // Delete invalid applications
  const deleteIds = allInvalidApps.map(app => app._id);
  await Application.deleteMany({ _id: { $in: deleteIds } });

  // For each affected student, check if they have any valid placed application left
  for (const studentId of affectedStudentIds) {
    const validPlaced = await Application.exists({ studentId, status: 'placed', companyId: { $in: companyIds } });
    if (!validPlaced) {
      await User.findByIdAndUpdate(studentId, { isPlaced: false });
    }
  }

  console.log(`Removed ${deleteIds.length} invalid placed applications and updated student statuses.`);
  await mongoose.disconnect();
}

cleanupInvalidPlacements().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
