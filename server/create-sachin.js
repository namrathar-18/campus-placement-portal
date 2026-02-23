import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal';

const createSachin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ registerNumber: '257245' });
    if (existingUser) {
      console.log('⚠️  User with register number 257245 already exists');
      console.log('   Name:', existingUser.name);
      console.log('   Role:', existingUser.role);
      await mongoose.connection.close();
      return;
    }

    // Create student representative - Sachin
    const sachin = await User.create({
      name: 'Sachin',
      registerNumber: '257245',
      password: '257245', // Will be hashed automatically
      role: 'student_representative',
      isRepresentative: true,
      representativeDesignation: 'department_representative',
      department: 'MCA',
      section: 'A',
      phone: '9876543210',
      gpa: 8.5,
    });

    console.log('✅ Student Representative created successfully:');
    console.log('   Name: Sachin');
    console.log('   Register Number: 257245');
    console.log('   Password: 257245');
    console.log('   Role: student_representative');
    console.log('   Department: MCA');
    console.log('\n📋 Login Instructions:');
    console.log('   1. Click on "Student" login option');
    console.log('   2. Register Number: 257245');
    console.log('   3. Password: 257245');
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error creating representative:', error);
    process.exit(1);
  }
};

createSachin();
