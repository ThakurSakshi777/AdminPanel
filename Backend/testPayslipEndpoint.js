#!/usr/bin/env node
/**
 * Test Salary Slip Generation Endpoint
 * This tests the /api/payslip/generate-and-send endpoint
 */

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testEndpoint = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Find an HR user
    const hrUser = await User.findOne({ role: 'hr' });
    if (!hrUser) {
      console.log('❌ No HR user found');
      process.exit(1);
    }

    console.log(`👤 Using HR User: ${hrUser.name} (${hrUser.email})`);
    console.log(`🔐 User ID: ${hrUser._id}`);
    console.log(`📋 User Role: ${hrUser.role}\n`);

    // Generate JWT token
    const token = jwt.sign(
      { id: hrUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(`🔑 Generated Token: ${token.substring(0, 20)}...\n`);

    // Find some employees
    const employees = await User.find({ role: 'employee' }).limit(2);
    if (employees.length === 0) {
      console.log('❌ No employees found');
      process.exit(1);
    }

    console.log(`👥 Found ${employees.length} employees:`);
    employees.forEach((emp, i) => {
      console.log(`   ${i + 1}. ${emp.name} (${emp.email})`);
    });

    const employeeIds = employees.map(e => e._id.toString());

    // Test the endpoint
    console.log('\n🧪 Testing Endpoint: POST /api/payslip/generate-and-send\n');

    const response = await fetch('http://localhost:5000/api/payslip/generate-and-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        employeeIds,
        month: 11,
        year: 2025,
        message: 'Test salary slip generation'
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    const data = await response.json();
    console.log(`📋 Response:`, JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Endpoint works correctly');
    } else {
      console.log('\n❌ ERROR! Check the response above');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testEndpoint();
