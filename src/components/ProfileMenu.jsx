import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, UserRound, Users, MessageCircle, LogOut } from 'lucide-react';
import Avatar from './common/Avatar';

export default function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return (
    <div className="header-profile-menu" ref={root} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" className="header-profile-trigger" aria-expanded={open} aria-controls="header-profile-links" aria-label={`เมนูโปรไฟล์ ${user.displayName || user.username}`} onClick={() => setOpen(!open)}>
        <Avatar src={user.avatarUrl} size="small" />
        <span className="header-profile-name">{user.displayName || user.username}</span>
        <ChevronDown size={16} aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <nav id="header-profile-links" className="header-profile-dropdown" aria-label="เมนูโปรไฟล์">
          <NavLink to="/profile" onClick={() => setOpen(false)}><UserRound size={20} aria-hidden="true" />My Profile</NavLink>
          <NavLink to="/my-buddies" onClick={() => setOpen(false)}><Users size={20} aria-hidden="true" />My Buddy</NavLink>
          <NavLink to="/messages" onClick={() => setOpen(false)}><MessageCircle size={20} aria-hidden="true" />Message</NavLink>
          <div className="header-profile-divider" />
          <button type="button" className="header-profile-logout" onClick={() => {
            setOpen(false);
            trigger.current?.focus();
            onLogout();
          }}><LogOut size={20} aria-hidden="true" />ออกจากระบบ</button>
        </nav>
      )}
    </div>
  );
}
