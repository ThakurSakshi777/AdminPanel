import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';

dotenv.config();

const syncEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    // Create employee records for each user
    for (const user of users) {
      // Check if employee already exists
      const existingEmployee = await Employee.findOne({ userId: user._id });
      
      if (!existingEmployee) {
        const employee = await Employee.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          position: user.position || '',
          department: user.department || '',
          phone: user.phone || '',
          status: 'Active',
        });
        console.log(`✅ Created employee: ${employee.name} (${employee.employeeId})`);
      } else {
        console.log(`⚠️  Employee already exists: ${user.name}`);
      }
    }

    const allEmployees = await Employee.find({});
    console.log(`\n📊 Total Employees: ${allEmployees.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Sync completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

syncEmployees();
