import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const updates = [
  { role: 'student_representative', email: 'namrp.18@gmail.com', password: 'studentrep' },
  { role: 'placement_officer',      email: 'jasminchopda540@gmail.com', password: 'placementofficer' },
];

const run = async () => {
  await connectDB();

  for (const { role, email, password } of updates) {
    const hashed = await bcrypt.hash(password, 10);
    const result = await User.findOneAndUpdate(
      { role },
      { email: email.toLowerCase(), password: hashed },
      { new: true }
    );
    if (result) {
      console.log(`✓ Updated ${role}: email=${result.email}`);
    } else {
      console.log(`✗ No user found with role: ${role}`);
    }
  }

  await mongoose.disconnect();
};

run().catch(console.error);
