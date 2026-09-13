import React, { Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';
import AccountLayout from './components/AccountLayout';
import { profileNavigation } from './config/profileNavigation';

const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProfileEditor = React.lazy(() => import('./pages/ProfileEditor'));
const ProfileOnboardingEditor = React.lazy(() => import('./pages/ProfileOnboardingEditor'));
const Settings = React.lazy(() => import('./pages/Settings'));
const EventList = React.lazy(() => import('./pages/EventList'));
const EventDetails = React.lazy(() => import('./pages/EventDetails'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
import './style.css';

const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<UnsavedChangesProvider />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/users/:userId" element={<UserProfile />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/buddies" element={<Navigate to="/events" replace />} />

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
                if (page.to === '/profile/settings') return <Route key={page.to} path="settings" element={<Settings />} />;
                return <Route key={page.to} path={page.to.slice('/profile/'.length)} element={<Profile page={page} />} />;
              })}
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
  </Route>
));

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}
