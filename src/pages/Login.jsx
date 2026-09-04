import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    // If the backend has full data, we use the onboardingStatus. 
    // In our mock, test user is 'completed', new user is 'not_started'
    if (user.onboardingStatus === 'completed') {
      navigate('/profile', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  };

  return (
    <div className="login-page-container">
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
}
