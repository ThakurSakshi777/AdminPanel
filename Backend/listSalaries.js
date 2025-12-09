import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Salary from './models/Salary.js';

dotenv.config();

const listSalaries = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const salaries = await Salary.find({});
    
    console.log('📋 All Salary Records:\n');
    
    if (salaries.length === 0) {
      console.log('❌ No salary records found in database!');
      console.log('Set salary first using POST /api/salary\n');
    } else {
      salaries.forEach((salary, index) => {
        console.log(`${index + 1}. Salary ID: ${salary._id}`);
        console.log(`   Employee: ${salary.employeeName} (${salary.employeeId})`);
        console.log(`   Basic: ₹${salary.basicSalary}`);
        console.log(`   Gross: ₹${salary.grossSalary}`);
        console.log(`   Net: ₹${salary.netSalary}`);
        console.log(`   Active: ${salary.isActive}`);
        console.log(`   Effective From: ${salary.effectiveFrom.toISOString().split('T')[0]}\n`);
      });
      
      console.log(`\n✅ Total Salary Records: ${salaries.length}`);
      console.log(`\n📌 Copy the Salary ID from above to update\n`);
      console.log(`Example Update API:`);
      console.log(`PUT http://localhost:5000/api/salary/${salaries[0]._id}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listSalaries();
