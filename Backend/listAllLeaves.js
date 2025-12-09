import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Leave from './models/Leave.js';

dotenv.config();

const listLeaves = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const leaves = await Leave.find({});
    
    console.log('📋 All Leave Requests:\n');
    
    if (leaves.length === 0) {
      console.log('❌ No leave requests found in database!');
      console.log('Apply leave first using employee token.\n');
    } else {
      leaves.forEach((leave, index) => {
        console.log(`${index + 1}. Leave ID: ${leave._id}`);
        console.log(`   Employee: ${leave.employeeName} (${leave.employeeId})`);
        console.log(`   Type: ${leave.leaveType}`);
        console.log(`   Dates: ${leave.startDate.toISOString().split('T')[0]} to ${leave.endDate.toISOString().split('T')[0]}`);
        console.log(`   Total Days: ${leave.totalDays}`);
        console.log(`   Status: ${leave.status}`);
        console.log(`   Reason: ${leave.reason}\n`);
      });
      
      console.log(`\n✅ Total Leaves: ${leaves.length}`);
      console.log(`\n📌 Copy the Leave ID from above to approve/reject\n`);
      console.log(`Example Approve API:`);
      console.log(`PUT http://localhost:5000/api/leaves/${leaves[0]._id}/approve\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listLeaves();
