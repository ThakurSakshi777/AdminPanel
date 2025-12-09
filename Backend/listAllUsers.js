import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const users = await User.find({}).select('name email role employeeId');
    
    console.log('📋 All Users in Database:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Employee ID: ${user.employeeId}`);
      console.log(`   Password: Use "password123" for employees, "hr123" for HR\n`);
    });

    console.log(`\n✅ Total Users: ${users.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();
