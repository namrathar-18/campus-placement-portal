import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const upsertPlacementUser = async () => {
  try {
    await connectDB();

    const email = 'placement@gmail.com';
    const password = 'password';
    const name = 'Placement Officer';

    const existing = await User.findOne({ email });

    if (existing) {
      existing.password = password;
      existing.role = 'placement_officer';
      existing.name = name;
      await existing.save();
      console.log('✅ Updated placement officer user');
    } else {
      await User.create({ email, password, name, role: 'placement_officer' });
      console.log('✅ Created placement officer user');
    }

    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: placement_officer');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating placement officer:', error.message);
    process.exit(1);
  }
};

upsertPlacementUser();
