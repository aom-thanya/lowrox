import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import Modal from './common/Modal';

export default function LoginModal({ isOpen, onClose, redirectOnComplete }) {
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    onClose();
    if (user.onboardingStatus === 'completed') {
      navigate(redirectOnComplete || '/profile');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideCloseButton={true} className="max-w-[400px] w-full">
      <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
        &times;
      </button>
      <LoginForm onSuccess={handleSuccess} />
    </Modal>
  );
}
