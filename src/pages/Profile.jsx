import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="main-content container text-center">
        <div className="hero-text">
          <h1 className="display-lg text-orange">Profile</h1>
          <p className="body-lg" style={{ marginTop: 'var(--space-4)', color: 'var(--color-neutral-600)' }}>
            ยินดีต้อนรับคุณ {user?.username}
          </p>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: '32px' }}>ออกจากระบบ</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
