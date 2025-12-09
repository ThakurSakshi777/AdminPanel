import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const testUsers = [
      {
        name: 'HR Admin',
        email: 'admin@company.com',
        password: '123456',
        role: 'hr',
        employeeId: 'HR001',
        department: 'HR',
        position: 'HR Admin'
      },
      {
        name: 'Test Employee 1',
        email: 'emp1@company.com',
        password: '123456',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'IT',
        position: 'Developer'
      },
      {
        name: 'Test Employee 2',
        email: 'emp2@company.com',
        password: '123456',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Finance',
        position: 'Accountant'
      }
    ];

    console.log('📝 Creating/Updating Test Accounts...\n');

    for (const userData of testUsers) {
      const existing = await User.findOne({ email: userData.email });
      
      if (existing) {
        console.log(`✅ Already exists: ${userData.email}`);
      } else {
        await User.create(userData);
        console.log(`✅ Created: ${userData.email}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST ACCOUNTS AVAILABLE:');
    console.log('='.repeat(50));
    
    console.log('\n🔒 HR ACCOUNT (For sending salary slips):');
    console.log('   Email: admin@company.com');
    console.log('   Password: 123456');
    
    console.log('\n👥 EMPLOYEE ACCOUNTS (For viewing slips):');
    console.log('   Email: emp1@company.com | Password: 123456');
    console.log('   Email: emp2@company.com | Password: 123456');
    console.log('   Email: kritika@gmail.com | Password: kritika123');
    
    console.log('\n' + '='.repeat(50));

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createTestUsers();
