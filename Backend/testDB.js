import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Create a test user
    const testUser = await User.create({
      name: 'Test HR Manager',
      email: 'testhr@company.com',
      password: 'test1234',
      role: 'hr',
      department: 'HR',
      position: 'Manager'
    });

    console.log('✅ User Created Successfully:');
    console.log('ID:', testUser._id);
    console.log('Name:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Employee ID:', testUser.employeeId);
    console.log('Role:', testUser.role);

    // Fetch all users from database
    const allUsers = await User.find({});
    console.log('\n📊 Total Users in Database:', allUsers.length);
    
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.employeeId}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testDB();
