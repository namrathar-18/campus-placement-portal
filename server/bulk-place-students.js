import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Company from './models/Company.js';
import Application from './models/Application.js';

dotenv.config();

const TARGET_COUNT = 70;

const run = async () => {
  await connectDB();

  // Get all student users who are not yet placed
  const unplacedStudents = await User.find({ role: 'student', isPlaced: { $ne: true } }).lean();
  console.log(`Found ${unplacedStudents.length} unplaced students`);

  if (unplacedStudents.length === 0) {
    console.log('No unplaced students found.');
    await mongoose.disconnect();
    return;
  }

  // Pick up to TARGET_COUNT students
  const toPlace = unplacedStudents.slice(0, TARGET_COUNT);

  // Get available companies
  const companies = await Company.find({}).lean();
  if (companies.length === 0) {
    console.log('No companies found. Seed companies first.');
    await mongoose.disconnect();
    return;
  }

  let placedCount = 0;

  for (const student of toPlace) {
    // Pick a company (cycle through them)
    const company = companies[placedCount % companies.length];

    try {
      // Upsert: if application exists update it, else create it
      await Application.findOneAndUpdate(
        { studentId: student._id, companyId: company._id },
        { status: 'placed' },
        { upsert: true, new: true }
      );

      // Mark the user as placed
      await User.findByIdAndUpdate(student._id, { isPlaced: true });

      placedCount++;
      console.log(`[${placedCount}] Placed: ${student.name} → ${company.name}`);
    } catch (err) {
      console.error(`Failed for ${student.name}: ${err.message}`);
    }
  }

  console.log(`\nDone. ${placedCount} student(s) marked as placed.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
