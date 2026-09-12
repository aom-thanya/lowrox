import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../LoginModal';
import Button from '../common/Button';

export default function FindBuddyCTA({ className = '', variant = 'primary' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleClick = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsChecking(true);
    // Add artificial delay for UX to show loading state if checking session
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (user.onboardingStatus === 'completed') {
      navigate('/buddies');
    } else {
      navigate('/onboarding', { state: { redirectOnComplete: '/buddies' } });
    }
    
    setIsChecking(false);
  };

  return (
    <>
      <Button
        variant={variant}
        className={`btn-cta ${className}`}
        onClick={handleClick}
        disabled={isChecking}
      >
        {isChecking ? 'กำลังตรวจสอบ...' : 'เริ่มหา Buddy'}
      </Button>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        redirectOnComplete="/buddies"
      />
    </>
  );
}
