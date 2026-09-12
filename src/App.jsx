import React from 'react';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import ProfileEditor from './pages/ProfileEditor';
import ProfileOnboardingEditor from './pages/ProfileOnboardingEditor';
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';
import AccountLayout from './components/AccountLayout';
import { profileNavigation } from './config/profileNavigation';
import './style.css';

const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<UnsavedChangesProvider />}>
          <Route path="/" element={<Home />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute requireOnboardingComplete={false} />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<AccountLayout items={profileNavigation} label="My Profile" />}>
              {profileNavigation.map((page) => {
                if (page.to === '/profile') return <Route key={page.to} index element={<ProfileEditor />} />;
                if (page.to === '/profile/onboarding') return <Route key={page.to} path="onboarding" element={<ProfileOnboardingEditor />} />;
                return <Route key={page.to} path={page.to.slice('/profile/'.length)} element={<Profile page={page} />} />;
              })}
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
  </Route>
));

export default function App() {
  return <AuthProvider><RouterProvider router={router} /></AuthProvider>;
}
