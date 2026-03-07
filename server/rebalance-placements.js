import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Company from './models/Company.js';
import Application from './models/Application.js';

dotenv.config();

// Target ~62% placement rate per section (matching Section A's current ratio)
const TARGETS = {
  A: 36,      // already 36, no change needed
  B: 34,      // currently 55 → unplace 21
  'AI/ML': 35 // currently 0 → place 35
};

const run = async () => {
  await connectDB();

  const companies = await Company.find({}).lean();
  if (!companies.length) { console.log('No companies found.'); await mongoose.disconnect(); return; }

  // === 1. Unplace excess Section B students ===
  const placedB = await User.find({ role: 'student', section: 'B', isPlaced: true }).lean();
  const toUnplace = placedB.slice(TARGETS.B); // keep first 34, unplace the rest
  console.log(`Section B: ${placedB.length} placed → unplacing ${toUnplace.length}`);

  for (const student of toUnplace) {
    await User.findByIdAndUpdate(student._id, { isPlaced: false });
    // Set their placed application back to rejected
    await Application.updateMany(
      { studentId: student._id, status: 'placed' },
      { status: 'rejected' }
    );
    console.log(`  Unplaced: ${student.name}`);
  }

  // === 2. Place AI/ML students ===
  const unplacedAIML = await User.find({ role: 'student', section: 'AI/ML', isPlaced: { $ne: true } }).lean();
  const toPlace = unplacedAIML.slice(0, TARGETS['AI/ML']);
  console.log(`\nAI/ML: 0 placed → placing ${toPlace.length}`);

  let i = 0;
  for (const student of toPlace) {
    const company = companies[i % companies.length];
    await Application.findOneAndUpdate(
      { studentId: student._id, companyId: company._id },
      { status: 'placed' },
      { upsert: true, new: true }
    );
    await User.findByIdAndUpdate(student._id, { isPlaced: true });
    console.log(`  Placed: ${student.name} → ${company.name}`);
    i++;
  }

  // === Final stats ===
  console.log('\n=== Updated stats ===');
  for (const [sec, target] of Object.entries(TARGETS)) {
    const placed = await User.countDocuments({ role: 'student', section: sec, isPlaced: true });
    const total = await User.countDocuments({ role: 'student', section: sec });
    console.log(`${sec}: ${placed}/${total} placed (${Math.round(placed/total*100)}%)`);
  }

  await mongoose.disconnect();
};

run().catch(console.error);
