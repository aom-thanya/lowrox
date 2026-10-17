import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Onboarding() {
  const { user, updateOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectDestination = location.state?.redirectOnComplete || '/profile';
  
  // Ensure we open the modal as soon as this page is rendered if onboarding is not started.
  const [isModalOpen, setIsModalOpen] = useState(true);

  // If user is already completed onboarding, redirect them to profile.
  if (user && user.onboardingStatus === 'completed') {
    return <Navigate to="/profile" replace />;
  }

  const handleComplete = () => {
    setIsModalOpen(false);
    updateOnboardingStatus('completed');
    navigate(redirectDestination, { replace: true });
  };

  const handleClose = () => {
    // Requirements say "หากผู้ใช้พยายามปิด ให้แสดง Confirmation ก่อน"
    // Which is handled inside OnboardingModal.
    // If they really confirm exit, we can redirect them back to home or logout.
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen items-center justify-center container text-center">
        <h1 className="display-lg text-orange">Onboarding</h1>
        <p className="body-lg" style={{ marginTop: 'var(--space-4)', color: 'var(--color-neutral-600)' }}>
          ระบบกำลังเตรียมความพร้อมให้คุณ กรุณากรอกข้อมูลในหน้าต่าง Onboarding
        </p>
      </div>
      <Footer />

      <OnboardingModal 
        isOpen={isModalOpen} 
        onClose={handleClose} 
        onComplete={handleComplete} 
        redirectDestination={redirectDestination}
      />
    </>
  );
}
