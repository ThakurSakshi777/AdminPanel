#!/usr/bin/env node
/**
 * Quick Setup Script - Add Sample Salary Data for Testing
 * 
 * Yeh script database mein sample salary records add karega
 * taki salary slip generation test kar sake
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Salary from './models/Salary.js';
import User from './models/User.js';

dotenv.config();

const setupSalaries = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get all employees
    const employees = await User.find({ role: 'employee' }).limit(5);

    if (employees.length === 0) {
      console.log('❌ No employees found!');
      console.log('First create employees in the system\n');
      process.exit(1);
    }

    console.log(`📍 Found ${employees.length} employees\n`);

    // Get HR user for createdBy
    const hrUser = await User.findOne({ role: 'hr' });
    if (!hrUser) {
      console.log('❌ No HR user found!');
      process.exit(1);
    }

    console.log(`👤 Using HR: ${hrUser.name}\n`);

    // Create salary records for each employee
    const salaries = [];
    for (const employee of employees) {
      // Check if salary already exists
      const existing = await Salary.findOne({ userId: employee._id, isActive: true });
      
      if (existing) {
        console.log(`⏭️  ${employee.name} - Already has active salary`);
        salaries.push(existing);
        continue;
      }

      // Create new salary record
      const salary = await Salary.create({
        userId: employee._id,
        employeeId: employee.employeeId || employee._id.toString().slice(-6),
        employeeName: employee.name,
        basicSalary: 50000,
        allowances: {
          HRA: 10000,
          DA: 5000,
          TA: 2000,
          medical: 1000,
          other: 500
        },
        deductions: {
          PF: 3600,
          tax: 5000,
          insurance: 1000,
          other: 500
        },
        effectiveFrom: new Date(),
        isActive: true,
        createdBy: hrUser._id,
        createdByName: hrUser.name
      });

      salaries.push(salary);
      console.log(`✅ Created salary for: ${employee.name}`);
      console.log(`   └─ Basic: ₹${salary.basicSalary}`);
      console.log(`   └─ Gross: ₹${salary.grossSalary}`);
      console.log(`   └─ Net: ₹${salary.netSalary}\n`);
    }

    console.log(`\n✨ Setup Complete!`);
    console.log(`\n📌 Created/Updated ${salaries.length} salary records\n`);
    console.log(`👉 Ab aap salary slip generation test kar sakte ho:\n`);
    console.log(`   1. HR se login karo`);
    console.log(`   2. Navigate: Sidebar → 💰 Salary Slips`);
    console.log(`   3. Employees select karo`);
    console.log(`   4. Generate Slips par click karo\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupSalaries();
