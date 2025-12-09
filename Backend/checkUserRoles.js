#!/usr/bin/env node
/**
 * Fix HR User Role - Ensure HR users have correct role
 * This script updates user roles to ensure proper access
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixHRRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Find all users
    const allUsers = await User.find({});
    console.log(`📍 Found ${allUsers.length} total users\n`);

    console.log('User Details:');
    console.log('─'.repeat(80));
    allUsers.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   isActive: ${user.isActive}`);
      console.log('');
    });

    // Check for HR users
    const hrUsers = await User.find({ role: 'hr' });
    console.log(`\n📊 Summary:`);
    console.log(`Total HR Users: ${hrUsers.length}`);
    console.log(`Total Employees: ${allUsers.filter(u => u.role === 'employee').length}`);
    console.log(`Total Admins: ${allUsers.filter(u => u.role === 'admin').length}`);

    if (hrUsers.length === 0) {
      console.log('\n⚠️  No HR users found! Converting first admin to HR...');
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        admin.role = 'hr';
        await admin.save();
        console.log(`✅ Converted ${admin.name} (${admin.email}) to HR role`);
      } else {
        console.log('❌ No admin found to convert');
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixHRRoles();
