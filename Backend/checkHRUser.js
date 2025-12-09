import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';

dotenv.config();

const checkAndCreateHR = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms_db');
    console.log('✅ Connected to MongoDB\n');

    // Check for existing HR users
    const hrUsers = await User.find({ role: 'hr' });
    console.log(`Found ${hrUsers.length} HR user(s):\n`);
    
    hrUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Employee ID: ${user.employeeId}`);
      console.log(`   Active: ${user.isActive}\n`);
    });

    // Check all users
    const allUsers = await User.find({});
    console.log(`\nAll users (${allUsers.length} total):`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} - Role: ${user.role}`);
    });

    // If no HR users, offer to create one
    if (hrUsers.length === 0) {
      console.log('\n⚠️ No HR users found!');
      console.log('\nTo create an HR user, you can:');
      console.log('1. Log in and create an employee with role "hr" from the Employee Management page');
      console.log('2. Or update an existing user role in the database\n');
      
      // Show how to update existing user
      if (allUsers.length > 0) {
        console.log('Example: To make the first user an HR:');
        console.log(`User.findByIdAndUpdate('${allUsers[0]._id}', { role: 'hr' })`);
        console.log(`Employee.findOneAndUpdate({ userId: '${allUsers[0]._id}' }, { role: 'hr' })\n`);
      }
    } else {
      console.log('\n✅ HR users exist. You can log in with:');
      hrUsers.forEach((user) => {
        console.log(`   Email: ${user.email}`);
        console.log(`   (Use the password you set during registration)\n`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAndCreateHR();
