import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    userRole: null,
    isLoading: true
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedRole && storedToken) {
      setAuthState({
        user: storedUser ? JSON.parse(storedUser) : null,
        userRole: storedRole,
        isLoading: false
      });
    } else {
      setAuthState({
        user: null,
        userRole: null,
        isLoading: false
      });
    }
  }, []);

  const login = (userData, role, token) => {
    setAuthState({
      user: userData,
      userRole: role,
      isLoading: false
    });
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setAuthState({
      user: null,
      userRole: null,
      isLoading: false
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
  };

  const isAuthenticated = !!authState.userRole;
  const isHR = authState.userRole === 'hr';
  const isEmployee = authState.userRole === 'employee';

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      userRole: authState.userRole,
      isAuthenticated,
      isHR,
      isEmployee,
      isLoading: authState.isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
