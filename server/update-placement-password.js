import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const updatePlacementPassword = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: 'placement@gmail.com' });

    if (!user) {
      console.log('❌ Placement officer not found');
      process.exit(1);
    }

    user.password = 'password';
    await user.save();

    console.log('✅ Placement officer password updated successfully');
    console.log('Email: placement@gmail.com');
    console.log('Password: password');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

updatePlacementPassword();
