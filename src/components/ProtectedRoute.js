import React from 'react';
import { useAuth } from './Login';
import Login from './Login';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return children;
};

export default ProtectedRoute;