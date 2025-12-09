import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const generateTokens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get HR user
    const hrUser = await User.findOne({ email: 'hr@company.com' });
    
    // Get Sakshi (employee)
    const employeeUser = await User.findOne({ email: 'sakshithakur@company.com' });

    if (hrUser) {
      const hrToken = jwt.sign({ id: hrUser._id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      
      console.log('🔐 HR Manager Token:');
      console.log(`Name: ${hrUser.name}`);
      console.log(`Email: ${hrUser.email}`);
      console.log(`Role: ${hrUser.role}`);
      console.log(`Token: ${hrToken}\n`);
    }

    if (employeeUser) {
      const empToken = jwt.sign({ id: employeeUser._id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      
      console.log('👤 Employee Token (Sakshi Thakur):');
      console.log(`Name: ${employeeUser.name}`);
      console.log(`Email: ${employeeUser.email}`);
      console.log(`Role: ${employeeUser.role}`);
      console.log(`EmployeeId: ${employeeUser.employeeId}`);
      console.log(`Token: ${empToken}\n`);
    }

    console.log('✅ Copy tokens from above for Postman testing!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

generateTokens();
