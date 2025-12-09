#!/usr/bin/env node
/**
 * Test Salary Slip Generation Endpoint
 * 
 * Ye script backend endpoint test karega
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Salary from './models/Salary.js';
import User from './models/User.js';

dotenv.config();

const testEndpoint = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get first HR user
    const hrUser = await User.findOne({ role: 'hr' });
    if (!hrUser) {
      console.log('❌ No HR user found');
      process.exit(1);
    }

    console.log(`👤 HR User: ${hrUser.name}`);
    console.log(`📧 Email: ${hrUser.email}\n`);

    // Get some employees with salaries
    const salaries = await Salary.find({ isActive: true }).limit(3);

    if (salaries.length === 0) {
      console.log('❌ No employees with salary found');
      console.log('Run: node setupSalaries.js\n');
      process.exit(1);
    }

    console.log(`📊 Found ${salaries.length} employees with active salary:\n`);
    salaries.forEach((s, i) => {
      console.log(`${i + 1}. ${s.employeeName} - Basic: ₹${s.basicSalary}`);
    });

    // Show endpoint info
    console.log('\n\n📡 ENDPOINT TEST:\n');
    console.log('URL: POST http://localhost:5000/api/payslip/generate-and-send');
    console.log('\nHeaders:');
    console.log('  Content-Type: application/json');
    console.log('  Authorization: Bearer {YOUR_JWT_TOKEN}');

    console.log('\nPayload:');
    const employeeIds = salaries.map(s => s.userId);
    console.log(JSON.stringify({
      employeeIds,
      month: 11,
      year: 2025,
      message: "Your salary slip for November 2025 is attached."
    }, null, 2));

    console.log('\n\n✅ To test this endpoint:');
    console.log('1. Login as HR in the UI');
    console.log('2. Go to Salary Slips page');
    console.log('3. Select employees');
    console.log('4. Click "Send Slips" button');
    console.log('5. Check browser console for response\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testEndpoint();
