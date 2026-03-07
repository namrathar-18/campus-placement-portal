import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const students = await User.find({ role: 'student' }, 'name section isPlaced').lean();

  const stats = {};
  for (const s of students) {
    const sec = s.section || 'unknown';
    if (!stats[sec]) stats[sec] = { placed: 0, unplaced: 0, total: 0 };
    stats[sec].total++;
    if (s.isPlaced) stats[sec].placed++;
    else stats[sec].unplaced++;
  }

  console.log('\n=== Section-wise stats ===');
  for (const [sec, d] of Object.entries(stats)) {
    console.log(`${sec}: total=${d.total}, placed=${d.placed}, unplaced=${d.unplaced}`);
  }

  await mongoose.disconnect();
};

run().catch(console.error);
