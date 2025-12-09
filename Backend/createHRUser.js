import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

const createHRUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Check if HR user already exists
    const existingHR = await User.findOne({ email: 'hr@company.com' });
    if (existingHR) {
      console.log('HR user already exists!');
      console.log(`Email: hr@company.com`);
      console.log(`Password: hr123`);
      console.log(`Role: ${existingHR.role}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create HR user
    const hrUser = await User.create({
      name: 'HR Manager',
      email: 'hr@company.com',
      password: 'hr123',
      role: 'hr',
      employeeId: 'HR001',
      department: 'HR',
      position: 'HR Manager',
    });

    console.log('✅ HR User Created Successfully!\n');
    console.log('Login Credentials:');
    console.log('─'.repeat(40));
    console.log(`Email: hr@company.com`);
    console.log(`Password: hr123`);
    console.log(`Role: ${hrUser.role}`);
    console.log(`Employee ID: ${hrUser.employeeId}`);
    console.log('─'.repeat(40));

    await mongoose.disconnect();
    console.log('\n✅ Done! You can now login with HR account');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createHRUser();
