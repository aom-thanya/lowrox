import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };
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
      <header className={`header ${isScrolled ? 'scrolled' : ''}`} id="site-header">
        <div className="container">
          <Link to="/" className="logo" aria-label="Lowrox homepage">
            <img src={logoImg} alt="LOWROX" className="h-8" />
          </Link>
          
          <nav className="desktop-nav" aria-label="Main Navigation">
            <a href="#" className="nav-link">การประเมินระดับ</a>
            <a href="#" className="nav-link">แผนการซ้อม</a>
            <a href="#" className="nav-link">หาเพื่อนซ้อม</a>
            {user && <NavLink to="/profile" className="nav-link">My Profile</NavLink>}
          </nav>
          
          <div className="header-actions">
            {user ? <button className="btn btn-secondary btn-md" onClick={handleLogout}>ออกจากระบบ</button> : <button className="btn btn-primary btn-md btn-cta" onClick={() => setIsLoginModalOpen(true)}>เข้าสู่ระบบ</button>}
          </div>

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
          <a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>การประเมินระดับ</a>
          <a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>แผนการซ้อม</a>
          <a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>หาเพื่อนซ้อม</a>
          {user && <NavLink to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>My Profile</NavLink>}
        </nav>
        <div className="mobile-drawer-actions">
          {user ? <button className="btn btn-secondary btn-md w-full" onClick={handleLogout}>ออกจากระบบ</button> : <button className="btn btn-primary btn-md btn-cta w-full" onClick={() => { setIsMenuOpen(false); setIsLoginModalOpen(true); }}>เข้าสู่ระบบ</button>}
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
