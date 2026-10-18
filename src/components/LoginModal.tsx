import type { User } from '../types/models';
import React from 'react';
import { useNavigate, type Path } from 'react-router-dom';
import { getLoginDestination } from '../utils/authRedirect';
import LoginForm from './LoginForm';
import Modal from './common/Modal';

export default function LoginModal({ isOpen, onClose, redirectOnComplete, from }: { isOpen: boolean; onClose: () => void; redirectOnComplete?: string; from?: Partial<Path> | null }) {
  const navigate = useNavigate();

  const handleSuccess = (user: User) => {
    onClose();
    navigate(redirectOnComplete || getLoginDestination(user, from), { replace: !!from });
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
