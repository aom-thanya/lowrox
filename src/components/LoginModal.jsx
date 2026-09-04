import React, { useEffect, useRef } from 'react';
import LoginForm from './LoginForm';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSuccess = (user) => {
    onClose();
    if (user.onboardingStatus === 'completed') {
      navigate('/profile');
    } else {
      navigate('/onboarding');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} aria-modal="true" role="dialog">
      <div className="modal-content" ref={modalRef}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
