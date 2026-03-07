import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedPlacementOfficer = async () => {
  try {
    // Check if placement officer already exists
    const existingOfficer = await User.findOne({ email: 'placement@gmail.com' });

    if (existingOfficer) {
      console.log('Placement officer already exists');
      return;
    }

    // Create placement officer
    const officer = await User.create({
      email: 'placement@gmail.com',
      password: 'password',
      name: 'Placement Officer',
      role: 'placement_officer'
    });

    console.log('Placement officer created successfully');
    console.log('Email: placement@gmail.com');
    console.log('Password: password');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    throw error;
  }
};

const seedStudentRepresentative = async () => {
  try {
    const existingRep = await User.findOne({ email: 'studentrep@gmail.com' });
    if (existingRep) {
      console.log('Student representative already exists');
      return;
    }

    const rep = await User.create({
      email: 'studentrep@gmail.com',
      password: 'studentrep',
      name: 'Student Representative',
      role: 'student_representative'
    });

    console.log('Student representative created successfully');
    console.log('Email: studentrep@gmail.com');
    console.log('Password: studentrep');
  } catch (error) {
    console.error('Error seeding student representative:', error.message);
    throw error;
  }
};

const seedAll = async () => {
  try {
    await connectDB();
    await seedPlacementOfficer();
    await seedStudentRepresentative();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

seedAll();
