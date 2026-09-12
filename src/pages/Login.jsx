import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLoginDestination } from '../utils/authRedirect';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const navigate = useNavigate();

  const location = useLocation();
  const handleSuccess = (user) => {
    navigate(getLoginDestination(user, location.state?.from), { replace: true });
  };

  return (
    <div className="login-page-container">
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
}
