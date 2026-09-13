import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Image from './common/Image';
import { Menu } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from './ProfileMenu';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import LoginModal from './LoginModal';


export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { requestAction } = useUnsavedChanges();
  const handleLogout = () => requestAction(() => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMenuOpen]);

  return (
    <>
      <header className={`header ${user ? 'header-authenticated' : ''} ${isScrolled ? 'scrolled' : ''}`} id="site-header">
        <div className="container">
          <Link to="/" className="logo" aria-label="Lowrox homepage">
            <Image src={logoImg} alt="LOWROX" className="h-8" loading="eager" />
          </Link>
          
          <nav className="desktop-nav" aria-label="Main Navigation">
            {!user ? (
              <>
                <Link to="/events" className="nav-link">กิจกรรม</Link>
                <a href="/#how-it-works" className="nav-link">วิธีใช้งาน</a>
                <button className="nav-link bg-transparent border-none p-0 cursor-pointer" onClick={() => setIsLoginModalOpen(true)}>เข้าสู่ระบบ</button>
              </>
            ) : (
              <>
                <Link to="/events" className="nav-link">กิจกรรม</Link>
              </>
            )}
          </nav>
          
          {user && <ProfileMenu user={user} onLogout={handleLogout} />}

          {!user && (
            <div className="header-actions">
              <Link to="/events" className="btn btn-primary btn-md btn-cta">ดูกิจกรรม</Link>
            </div>
          )}

          <button 
            className="mobile-menu-btn" 
            id="mobile-menu-btn" 
            aria-label="Open navigation" 
            aria-expanded={isMenuOpen} 
            aria-controls="mobile-drawer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <div 
        className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`} 
        id="mobile-drawer" 
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        <nav className="mobile-drawer-nav" aria-label="Mobile Navigation">
            {!user ? (
              <>
                <Link to="/events" className="nav-link" onClick={() => setIsMenuOpen(false)}>กิจกรรม</Link>
                <a href="/#how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>วิธีใช้งาน</a>
                <button className="nav-link bg-transparent border-none p-0 cursor-pointer text-left w-full" onClick={() => { setIsMenuOpen(false); setIsLoginModalOpen(true); }}>เข้าสู่ระบบ</button>
              </>
            ) : (
              <>
                <Link to="/events" className="nav-link" onClick={() => setIsMenuOpen(false)}>กิจกรรม</Link>
              </>
            )}
        </nav>
        {!user && (
          <div className="mobile-drawer-actions">
            <Link to="/events" className="btn btn-primary btn-md btn-cta w-full" onClick={() => setIsMenuOpen(false)}>ดูกิจกรรม</Link>
          </div>
        )}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
