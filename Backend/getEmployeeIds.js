import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';

dotenv.config();

const getEmployeeIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const employees = await Employee.find({}, '_id name email employeeId role');
    
    console.log('📊 Available Employee IDs:\n');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name} (${emp.role})`);
      console.log(`   Employee ID: ${emp.employeeId}`);
      console.log(`   MongoDB _id: ${emp._id}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Test URL: GET http://localhost:5000/api/employees/${emp._id}\n`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

getEmployeeIds();
