import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import hrAuthRoutes from './routes/hrAuthRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import dailyReportRoutes from './routes/dailyReportRoutes.js';
import announcementRoutes from './routes/announcementRoute.js';
import notificationRoutes from './routes/notificationRoute.js';
import letterRoutes from './routes/letterRoute.js';
import hrActivityRoutes from './routes/hrActivityRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite default and alternate port
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hr-auth', hrAuthRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', salaryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/daily-reports', dailyReportRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/hr-activity', hrActivityRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS Backend Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 HRMS Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      employees: '/api/employees',
      attendance: '/api/attendance',
      leaves: '/api/leaves',
      tasks: '/api/tasks',
      projects: '/api/projects',
      salary: '/api/salary',
      payslip: '/api/payslip',
      documents: '/api/documents',
      reports: '/api/reports',
      performance: '/api/performance',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  console.error(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  console.error(`Available routes: /api/salary, /api/payslip, /api/auth, /api/employees, etc.`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requested: `${req.method} ${req.originalUrl}`,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📋 Salary Routes: http://localhost:${PORT}/api/salary`);
  console.log(`💰 Payslip Routes: http://localhost:${PORT}/api/payslip`);
});
