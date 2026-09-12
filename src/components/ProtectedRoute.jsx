import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getLoginDestination } from '../utils/authRedirect';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ requireOnboardingComplete = null }) {
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

  if (requireOnboardingComplete === false && onboardingStatus === 'completed') {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getLoginDestination(user, location.state?.from)} replace />;
  }

  return <Outlet />;
}
