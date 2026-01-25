import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedPlacementOfficer = async () => {
  try {
    await connectDB();

    // Check if placement officer already exists
    const existingOfficer = await User.findOne({ email: 'placement@gmail.com' });

    if (existingOfficer) {
      console.log('Placement officer already exists');
      process.exit(0);
    }

    // Create placement officer
    const officer = await User.create({
      email: 'placement@gmail.com',
      password: 'placement',
      name: 'Placement Officer',
      role: 'placement_officer'
    });

    console.log('Placement officer created successfully');
    console.log('Email: placement@gmail.com');
    console.log('Password: placement');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedPlacementOfficer();
