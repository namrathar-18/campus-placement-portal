import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Application from './models/Application.js';

dotenv.config();

const run = async () => {
  await connectDB();

  // Find all placed applications
  const placedApps = await Application.find({ status: 'placed' }).lean();
  console.log(`Found ${placedApps.length} placed applications`);

  let removed = 0;
  for (const placed of placedApps) {
    const { studentId, _id } = placed;

    // Delete all OTHER applications for this student that are not placed
    const result = await Application.deleteMany({
      studentId,
      _id: { $ne: _id },
    });

    if (result.deletedCount > 0) {
      console.log(`  Cleaned ${result.deletedCount} extra application(s) for student ${studentId}`);
      removed += result.deletedCount;
    }
  }

  console.log(`\nDone. Removed ${removed} stale application(s).`);
  await mongoose.disconnect();
};

run().catch(console.error);
