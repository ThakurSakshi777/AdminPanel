import mongoose from 'mongoose';
import Employee from './models/Employee.js';
import User from './models/User.js';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms_db');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const fixEmployeeNames = async () => {
  try {
    await connectDB();
    
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);
    
    for (const emp of employees) {
      console.log(`\nChecking Employee ID: ${emp.employeeId}`);
      console.log(`Current name: "${emp.name}"`);
      
      if (!emp.name || emp.name === 'undefined' || emp.name === '') {
        console.log(`  ⚠️  Name is invalid, fetching from User...`);
        
        if (emp.userId) {
          const user = await User.findById(emp.userId);
          if (user && user.name) {
            emp.name = user.name;
            await emp.save();
            console.log(`  ✅ Updated name to: ${user.name}`);
          } else {
            console.log(`  ❌ User not found or has no name`);
          }
        } else {
          console.log(`  ❌ No userId linked`);
        }
      } else {
        console.log(`  ✓ Name is valid: ${emp.name}`);
      }
    }
    
    console.log('\n✨ All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixEmployeeNames();
