import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isUserLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const location = useLocation();

  if (!isUserLoggedIn) {
    // Redirect to login with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;