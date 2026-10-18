import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, NavLink, type Path } from 'react-router-dom';
import Image from './common/Image';
import { Flame, Gauge, Menu, Plus, UserRound, X, type LucideIcon } from 'lucide-react';
import logoImg from '../assets/logo-64.png';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from './ProfileMenu';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import LoginModal from './LoginModal';

type NavItem = { label: string; to: string; hash?: boolean };
type TabItem = { label: string; to: string; icon: LucideIcon };

// Guests: discover what Lowrox is. Hash links use a plain <a> so the browser jumps to the homepage section.
const GUEST_NAV: NavItem[] = [
  { label: 'ตี้ซ้อม', to: '/events' },
  { label: 'วิธีใช้งาน', to: '/#how-it-works', hash: true },
  { label: 'แพ็กเกจ', to: '/#plans', hash: true }
];
// Members: the training journey — know your level → train with a party.
const MEMBER_NAV: NavItem[] = [
  { label: 'เลเวลของฉัน', to: '/level' },
  { label: 'ตี้ซ้อม', to: '/events' }
];
// Phone tab bar for members, with the quick log in the middle.
const MEMBER_TABS: TabItem[] = [
  { label: 'เลเวล', to: '/level', icon: Gauge },
  { label: 'ตี้ซ้อม', to: '/events', icon: Flame },
  { label: 'โปรไฟล์', to: '/profile', icon: UserRound }
];
// Opens the run log on the level page from anywhere.
export const LOG_RUN_PATH = '/level?log=1';

const navClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { requestAction } = useUnsavedChanges();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // ProtectedRoute redirects guests here with { login: true, from } instead of a login page.
  const loginRequest = location.state as { login?: boolean; from?: Partial<Path> } | null;
  const isLoginRequested = !user && !!loginRequest?.login;
  const isMember = user?.onboardingStatus === 'completed';

  const handleLogout = () => requestAction(() => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [isMenuOpen]);

  // Leave room for the phone tab bar so it never covers page content.
  useEffect(() => {
    document.body.classList.toggle('has-tabbar', isMember);
    return () => document.body.classList.remove('has-tabbar');
  }, [isMember]);

  const closeMenu = () => setIsMenuOpen(false);
  const navItems = user ? (isMember ? MEMBER_NAV : []) : GUEST_NAV;
  const renderNavItems = (onNavigate?: () => void) => navItems.map((item) => (
    item.hash
      ? <a key={item.label} href={item.to} className="nav-link" onClick={onNavigate}>{item.label}</a>
      : <NavLink key={item.label} to={item.to} className={navClass} onClick={onNavigate}>{item.label}</NavLink>
  ));

  return (
    <>
      <header className={`header ${user ? 'header-authenticated' : ''} ${isScrolled ? 'scrolled' : ''}`} id="site-header">
        <div className="page-container">
          <Link to={isMember ? '/level' : '/'} className="logo" aria-label="Lowrox homepage">
            <Image src={logoImg} alt="LOWROX" className="h-8" loading="eager" />
          </Link>

          <nav className="desktop-nav" aria-label="Main Navigation">
            {renderNavItems()}
          </nav>

          {user ? (
            <div className="header-member-actions">
              {isMember && (
                <Link to={LOG_RUN_PATH} className="btn btn-primary btn-md btn-cta header-log-btn"><Plus size={18} aria-hidden="true" />บันทึกการวิ่ง</Link>
              )}
              <ProfileMenu user={user} onLogout={handleLogout} />
            </div>
          ) : (
            <>
              <button type="button" className="btn btn-primary btn-md btn-cta header-login" onClick={() => setIsLoginModalOpen(true)}>เข้าสู่ระบบ</button>
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
            </>
          )}
        </div>
      </header>

      {!user && (
        <div
          className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}
          id="mobile-drawer"
          aria-hidden={!isMenuOpen}
          inert={!isMenuOpen}
        >
          <nav className="mobile-drawer-nav" aria-label="Mobile Navigation">
            {renderNavItems(closeMenu)}
          </nav>
        </div>
      )}

      {isMember && (
        <nav className="tabbar" aria-label="เมนูหลัก">
          {MEMBER_TABS.slice(0, 2).map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `tabbar-item${isActive ? ' is-active' : ''}`}><Icon size={22} aria-hidden="true" />{label}</NavLink>
          ))}
          <Link to={LOG_RUN_PATH} className="tabbar-log" aria-label="บันทึกการวิ่ง"><Plus size={26} aria-hidden="true" /></Link>
          {MEMBER_TABS.slice(2).map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/profile' ? false : undefined} className={({ isActive }) => `tabbar-item${isActive ? ' is-active' : ''}`}><Icon size={22} aria-hidden="true" />{label}</NavLink>
          ))}
        </nav>
      )}

      <LoginModal
        isOpen={isLoginModalOpen || isLoginRequested}
        onClose={() => {
          setIsLoginModalOpen(false);
          // Clear the request so closing the modal (or a refresh) doesn't reopen it.
          if (isLoginRequested) navigate(location, { replace: true, state: null });
        }}
        from={isLoginRequested ? loginRequest?.from : null}
      />
    </>
  );
}
