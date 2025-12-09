import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DateProvider } from './context/DateContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Projects from './pages/Projects';
import Leaves from './pages/Leaves';
import EmployeeProfile from './pages/EmployeeProfile';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import Announcements from './pages/Announcements';
import Listings from './pages/Listings';
import Security from './pages/Security';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmployeeSignup from './pages/EmployeeSignup';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import SalarySlip from './pages/SalarySlip';
import LeaveBalance from './pages/LeaveBalance';
import SalarySlipManagement from './pages/SalarySlipManagement';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeLeaves from './pages/EmployeeLeaves';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeSalary from './pages/EmployeeSalary';
import EmployeeProjects from './pages/EmployeeProjects';
import EmployeePerformance from './pages/EmployeePerformance';
import EmployeeAnnouncements from './pages/EmployeeAnnouncements';
import EmployeeDocuments from './pages/EmployeeDocuments';
import Documents from './pages/Documents';
import EmployeeLetters from './pages/EmployeeLetters';
import LettersManagement from './pages/LettersManagement';
import HRSignup from './pages/HRSignup';
import HRLogin from './pages/HRLogin';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Home redirect component - handles root URL navigation
const HomeRedirect = () => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  console.log('HomeRedirect - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'userRole:', userRole);

  // Always show loading state while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <div>Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  if (userRole === 'employee') {
    console.log('User is employee - redirecting to /employee-dashboard');
    return <Navigate to="/employee-dashboard" replace />;
  }

  console.log('User is HR - redirecting to /dashboard');
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <DateProvider>
        <Router>
          <Routes>
            {/* Root URL - Smart redirect based on auth status and role */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/hr-signup" element={<HRSignup />} />
            <Route path="/hr-login" element={<HRLogin />} />
            <Route path="/employee-signup" element={<EmployeeSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />

          {/* Employee Dashboard Route */}
          <Route path="/employee-dashboard" element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          {/* Employee Module Routes */}
          <Route path="/employee/attendance" element={
            <ProtectedRoute>
              <EmployeeAttendance />
            </ProtectedRoute>
          } />
          <Route path="/employee/leaves" element={
            <ProtectedRoute>
              <EmployeeLeaves />
            </ProtectedRoute>
          } />
          <Route path="/employee/salary" element={
            <ProtectedRoute>
              <EmployeeSalary />
            </ProtectedRoute>
          } />
          <Route path="/employee/projects" element={
            <ProtectedRoute>
              <EmployeeProjects />
            </ProtectedRoute>
          } />
          <Route path="/employee/performance" element={
            <ProtectedRoute>
              <EmployeePerformance />
            </ProtectedRoute>
          } />
          <Route path="/employee/announcements" element={
            <ProtectedRoute>
              <EmployeeAnnouncements />
            </ProtectedRoute>
          } />
          <Route path="/employee/documents" element={
            <ProtectedRoute>
              <EmployeeDocuments />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } />
          <Route path="/employee-letters" element={
            <ProtectedRoute>
              <EmployeeLetters />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* HR Module Routes */}
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="employee-profile" element={<EmployeeProfile />} />
            <Route path="projects" element={<Projects />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="performance" element={<Performance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="letters" element={<LettersManagement />} />
            
            {/* Common Routes */}
            <Route path="users" element={<Users />} />
            <Route path="listings" element={<Listings />} />
            <Route path="security" element={<Security />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="salary-slip" element={<SalarySlip />} />
            <Route path="leave-balance" element={<LeaveBalance />} />
            <Route path="salary-slip-management" element={<SalarySlipManagement />} />
            
            {/* Legacy Routes (for backward compatibility) */}
            <Route path="properties" element={<Navigate to="/employees" replace />} />
            <Route path="inquiries" element={<Navigate to="/attendance" replace />} />
            <Route path="complaints" element={<Navigate to="/leaves" replace />} />
            <Route path="services" element={<Navigate to="/projects" replace />} />
          </Route>

          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </DateProvider>
    </AuthProvider>
  );
}

export default App;
