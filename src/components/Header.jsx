import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import Avatar from './common/Avatar';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import LoginModal from './LoginModal';
import FindBuddyCTA from './home/FindBuddyCTA';

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
      <header className={`header ${isScrolled ? 'scrolled' : ''}`} id="site-header">
        <div className="container">
          <Link to="/" className="logo" aria-label="Lowrox homepage">
            <img src={logoImg} alt="LOWROX" className="h-8" />
          </Link>
          
          <nav className="desktop-nav" aria-label="Main Navigation">
            {!user ? (
              <>
                <a href="/#how-it-works" className="nav-link">วิธีใช้งาน</a>
                <button className="nav-link bg-transparent border-none p-0 cursor-pointer" onClick={() => setIsLoginModalOpen(true)}>เข้าสู่ระบบ</button>
              </>
            ) : (
              <>
                <Link to="/buddies" className="nav-link">หา Buddy</Link>
                <Link to="/my-buddies" className="nav-link">My Buddies</Link>
                <Link to="/messages" className="nav-link">Messages</Link>
                <NavLink to="/profile" className="nav-link nav-profile">
                  <Avatar src={user.avatarUrl} size="small" />
                  <span>
                    <span className="nav-profile-name">{user.displayName || user.username}</span>
                    <span className="body-sm">My Profile</span>
                  </span>
                </NavLink>
              </>
            )}
          </nav>
          
          <div className="header-actions">
            {user ? (
              <button className="btn btn-secondary btn-md" onClick={handleLogout}>ออกจากระบบ</button>
            ) : (
              <FindBuddyCTA variant="primary" />
            )}
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
            {!user ? (
              <>
                <a href="/#how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>วิธีใช้งาน</a>
                <button className="nav-link bg-transparent border-none p-0 cursor-pointer text-left w-full" onClick={() => { setIsMenuOpen(false); setIsLoginModalOpen(true); }}>เข้าสู่ระบบ</button>
              </>
            ) : (
              <>
                <Link to="/buddies" className="nav-link" onClick={() => setIsMenuOpen(false)}>หา Buddy</Link>
                <Link to="/my-buddies" className="nav-link" onClick={() => setIsMenuOpen(false)}>My Buddies</Link>
                <Link to="/messages" className="nav-link" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                <NavLink to="/profile" className="nav-link nav-profile" onClick={() => setIsMenuOpen(false)}>
                  <Avatar src={user.avatarUrl} size="small" />
                  <span>
                    <span className="nav-profile-name">{user.displayName || user.username}</span>
                    <span className="body-sm">My Profile</span>
                  </span>
                </NavLink>
              </>
            )}
        </nav>
        <div className="mobile-drawer-actions">
          {user ? (
            <button className="btn btn-secondary btn-md w-full" onClick={handleLogout}>ออกจากระบบ</button>
          ) : (
            <div onClick={() => setIsMenuOpen(false)}>
              <FindBuddyCTA variant="primary" className="w-full" />
            </div>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
