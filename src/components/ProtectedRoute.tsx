import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './common/LoadingScreen';

export function ProtectedRoute({ requireOnboardingComplete = null }: { requireOnboardingComplete?: boolean | null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // There is no login page: send guests home with the login modal open, then back here after signing in.
    return <Navigate to="/" state={{ login: true, from: location }} replace />;
  }

  const { onboardingStatus } = user;

  if (requireOnboardingComplete && onboardingStatus !== 'completed') {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireOnboardingComplete === false && onboardingStatus === 'completed') {
    return <Navigate to="/level" replace />;
  }

  return <Outlet />;
}

