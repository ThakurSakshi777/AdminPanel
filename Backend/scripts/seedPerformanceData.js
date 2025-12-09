import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Performance from '../models/Performance.js';
import Salary from '../models/Salary.js';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_db');
    console.log('✅ Connected to MongoDB');

    // Get the first employee user from database
    const employee = await User.findOne({ role: 'employee' });
    
    if (!employee) {
      console.error('❌ No employee user found in database');
      console.log('📝 Please create an employee account first via signup');
      process.exit(1);
    }

    console.log(`📝 Adding sample data for employee: ${employee.name} (${employee.email})`);

    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check if performance data already exists
    const existingPerformance = await Performance.findOne({
      userId: employee._id,
      'reviewPeriod.month': currentMonth,
      'reviewPeriod.year': currentYear,
    });

    if (!existingPerformance) {
      // Create sample performance data
      const performanceData = new Performance({
        employeeId: employee.employeeId || 'EMP001',
        userId: employee._id,
        rating: 4.5,
        overallScore: 85,
        tasksCompleted: 45,
        tasksAssigned: 50,
        taskCompletionRate: 90,
        attendanceRate: '95%',
        totalWorkingDays: 20,
        presentDays: 19,
        activeProjects: 3,
        completedProjects: 2,
        overtimeHours: 12,
        achievements: [
          {
            title: 'Project Delivery',
            description: 'Successfully delivered project on time',
            date: new Date(),
          },
          {
            title: 'Team Player',
            description: 'Great collaboration with team members',
            date: new Date(),
          },
        ],
        skills: [
          { name: 'React', proficiency: 'Advanced' },
          { name: 'Node.js', proficiency: 'Advanced' },
          { name: 'MongoDB', proficiency: 'Intermediate' },
          { name: 'Communication', proficiency: 'Expert' },
        ],
        feedback: 'Excellent performance this quarter. Keep up the good work!',
        strengths: ['Leadership', 'Technical Skills', 'Communication'],
        areasForImprovement: ['Time Management', 'Delegation'],
        reviewPeriod: {
          month: currentMonth,
          year: currentYear,
        },
        reviewDate: new Date(),
        nextReviewDate: new Date(now.setMonth(now.getMonth() + 3)),
      });

      await performanceData.save();
      console.log('✅ Performance data created successfully');
    } else {
      console.log('ℹ️  Performance data already exists for this period');
    }

    // Check if salary data already exists
    const existingSalary = await Salary.findOne({
      userId: employee._id,
      isActive: true,
    });

    if (!existingSalary) {
      // Create sample salary data
      const salaryData = new Salary({
        userId: employee._id,
        employeeId: employee.employeeId || 'EMP001',
        employeeName: employee.name,
        basicSalary: 50000,
        allowances: {
          HRA: 15000,
          DA: 10000,
          TA: 5000,
          medical: 2000,
          other: 3000,
        },
        deductions: {
          PF: 6000,
          tax: 8000,
          insurance: 1000,
          other: 500,
        },
        effectiveFrom: new Date('2024-01-01'),
        createdBy: employee._id,
        createdByName: 'System Admin',
        remarks: 'Sample salary record for testing',
      });

      await salaryData.save();
      console.log('✅ Salary data created successfully');
    } else {
      console.log('ℹ️  Salary data already exists');
    }

    console.log('✅ Seed data added successfully!');
    console.log('📊 Now refresh your browser to see the performance data on the page');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
