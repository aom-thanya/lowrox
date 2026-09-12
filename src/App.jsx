import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import AccountLayout from './components/AccountLayout';
import { profileNavigation } from './config/profileNavigation';
import './style.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute requireOnboardingComplete={false} />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<AccountLayout items={profileNavigation} label="My Profile" />}>
              {profileNavigation.map((page) => (
                page.to === '/profile'
                  ? <Route key={page.to} index element={<Profile page={page} />} />
                  : <Route key={page.to} path={page.to.slice('/profile/'.length)} element={<Profile page={page} />} />
              ))}
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
