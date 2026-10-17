import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getLoginDestination } from '../utils/authRedirect';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './common/LoadingScreen';

export function ProtectedRoute({ requireOnboardingComplete = null }: { requireOnboardingComplete?: boolean | null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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

export function PublicRoute() {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to={getLoginDestination(user, location.state?.from)} replace />;
  }

  return <Outlet />;
}
