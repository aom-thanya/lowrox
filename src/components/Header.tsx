import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import Image from './common/Image';
import { Menu, X } from 'lucide-react';
import logoImg from '../assets/logo-64.png';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from './ProfileMenu';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import LoginModal from './LoginModal';

type NavItem = { label: string; to: string; hash?: boolean };

// Hash links use a plain <a> so the browser jumps to the homepage section.
const GUEST_NAV: NavItem[] = [
  { label: 'กิจกรรม', to: '/events' },
  { label: 'วิธีใช้งาน', to: '/#how-it-works', hash: true },
  { label: 'แพ็กเกจ', to: '/#plans', hash: true }
];
const MEMBER_NAV: NavItem[] = [
  { label: 'กิจกรรม', to: '/events' },
  { label: 'แพ็กเกจ', to: '/#plans', hash: true }
];

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
    const handleEsc = (e: KeyboardEvent) => {
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

  const closeMenu = () => setIsMenuOpen(false);
  const navItems = user ? MEMBER_NAV : GUEST_NAV;
  const renderNavItems = (onNavigate?: () => void) => navItems.map((item) => (
    item.hash
      ? <a key={item.label} href={item.to} className="nav-link" onClick={onNavigate}>{item.label}</a>
      : <NavLink key={item.label} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onNavigate}>{item.label}</NavLink>
  ));

  return (
    <>
      <header className={`header ${user ? 'header-authenticated' : ''} ${isScrolled ? 'scrolled' : ''}`} id="site-header">
        <div className="container">
          <Link to="/" className="logo" aria-label="Lowrox homepage">
            <Image src={logoImg} alt="LOWROX" className="h-8" loading="eager" />
          </Link>

          <nav className="desktop-nav" aria-label="Main Navigation">
            {renderNavItems()}
          </nav>

          {user ? (
            <ProfileMenu user={user} onLogout={handleLogout} />
          ) : (
            <div className="header-actions">
              <button type="button" className="btn btn-primary btn-md btn-cta" onClick={() => setIsLoginModalOpen(true)}>เข้าสู่ระบบ</button>
            </div>
          )}

          <button
            className="mobile-menu-btn"
            id="mobile-menu-btn"
            aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
          {renderNavItems(closeMenu)}
        </nav>
        {!user && (
          <div className="mobile-drawer-actions">
            <button type="button" className="btn btn-primary btn-md btn-cta w-full" onClick={() => { closeMenu(); setIsLoginModalOpen(true); }}>เข้าสู่ระบบ</button>
          </div>
        )}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
