import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DateProvider } from './context/DateContext';
import { isAuthenticated } from './services/authService';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Properties from './pages/Properties';
import Listings from './pages/Listings';
import Inquiries from './pages/Inquiries';
import Complaints from './pages/Complaints';
import Services from './pages/Services';
import Security from './pages/Security';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const authenticated = isAuthenticated();

  return (
    <DateProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={authenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={authenticated ? <Navigate to="/dashboard" replace /> : <SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="properties" element={<Properties />} />
            <Route path="listings" element={<Listings />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="services" element={<Services />} />
            <Route path="security" element={<Security />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </DateProvider>
  );
}

export default App;
