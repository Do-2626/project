
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // If still loading auth state, show nothing or a loading spinner
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">جاري التحميل...</div>;
  }
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is logged in, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
