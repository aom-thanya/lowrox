import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ requireOnboardingComplete = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const { onboardingStatus } = user;

  if (requireOnboardingComplete && onboardingStatus !== 'completed') {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboardingComplete && onboardingStatus === 'completed') {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (user) {
    if (user.onboardingStatus === 'completed') {
      return <Navigate to="/profile" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <Outlet />;
}
