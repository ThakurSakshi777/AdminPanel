import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';
import User from './models/User.js';

dotenv.config();

const createTestTask = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get HR and Employee users
    const hrUser = await User.findOne({ email: 'hr@company.com' });
    const empUser = await User.findOne({ email: 'sakshithakur@company.com' });

    if (!hrUser || !empUser) {
      console.log('❌ Users not found!');
      process.exit(1);
    }

    // Create a test task
    const task = await Task.create({
      taskTitle: 'Complete User Dashboard',
      description: 'Design and implement user dashboard with charts and statistics',
      assignedTo: empUser._id,
      assignedToName: empUser.name,
      assignedToEmployeeId: empUser.employeeId,
      assignedBy: hrUser._id,
      assignedByName: hrUser.name,
      priority: 'High',
      status: 'Pending',
      dueDate: new Date('2025-11-30'),
      project: 'HRMS Project',
    });

    console.log('✅ Test Task Created!\n');
    console.log(`Task ID: ${task._id}`);
    console.log(`Task Title: ${task.taskTitle}`);
    console.log(`Assigned To: ${task.assignedToName} (${task.assignedToEmployeeId})`);
    console.log(`Status: ${task.status}`);
    console.log(`Priority: ${task.priority}`);
    console.log(`Due Date: ${task.dueDate.toISOString().split('T')[0]}\n`);

    console.log('📌 Update API:');
    console.log(`PUT http://localhost:5000/api/tasks/${task._id}\n`);
    
    console.log('Body (JSON):');
    console.log(`{
  "status": "In Progress",
  "remarks": "Started working on this task"
}\n`);

    console.log('Use Employee Token for update!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestTask();
