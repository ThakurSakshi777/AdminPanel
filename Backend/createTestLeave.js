import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Leave from './models/Leave.js';
import User from './models/User.js';

dotenv.config();

const createTestLeave = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms_db');
    console.log('✅ Connected to MongoDB\n');

    // Get an employee user
    const employee = await User.findOne({ role: 'employee' });
    
    if (!employee) {
      console.log('❌ No employee user found!');
      process.exit(1);
    }

    console.log(`Creating test leave for employee: ${employee.name} (${employee.email})\n`);

    const testLeave = await Leave.create({
      userId: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      leaveType: 'Casual Leave',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      reason: 'Test leave request for dashboard demo',
      status: 'Pending'
    });

    console.log('✅ Test leave created successfully!\n');
    console.log(`Leave ID: ${testLeave._id}`);
    console.log(`Employee: ${testLeave.employeeName} (${testLeave.employeeId})`);
    console.log(`Status: ${testLeave.status}`);
    console.log(`Dates: ${testLeave.startDate.toISOString().split('T')[0]} to ${testLeave.endDate.toISOString().split('T')[0]}`);
    console.log(`Total Days: ${testLeave.totalDays}\n`);

    console.log('Now check the HR Dashboard to see the pending leave request!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestLeave();
