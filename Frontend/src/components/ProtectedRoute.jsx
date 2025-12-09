import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Loading...</div>
    </div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and doesn't match, redirect to appropriate dashboard
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'hr' ? '/dashboard' : '/employee-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
