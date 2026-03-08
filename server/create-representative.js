import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal';

const createRepresentative = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a sample student representative
    const representative = await User.create({
      name: 'Student Representative',
<<<<<<< Updated upstream
      email: 'studentrep@gmail.com',
      password: 'studentrep', // Will be hashed automatically
=======
      registerNumber: 'REP2024001',
      password: 'representative123', // Will be hashed automatically
>>>>>>> Stashed changes
      role: 'student_representative',
      isRepresentative: true,
      representativeDesignation: 'department_representative',
      department: 'MCA',
      section: 'A',
      phone: '9876543210',
      gpa: 8.5,
    });

    console.log('✅ Student Representative created successfully:');
<<<<<<< Updated upstream
    console.log('   Email: studentrep@gmail.com');
    console.log('   Password: studentrep');
=======
    console.log('   Register Number: REP2024001');
    console.log('   Password: representative123');
>>>>>>> Stashed changes
    console.log('   Role: student_representative');
    console.log('   Department: MCA');
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating representative:', error);
    process.exit(1);
  }
};

createRepresentative();
