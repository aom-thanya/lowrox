import type { User } from '../types/models';
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Gauge, UserRound, Users, LogOut } from 'lucide-react';
import Avatar from './common/Avatar';

export default function ProfileMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
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
          <NavLink to="/level" onClick={() => setOpen(false)}><Gauge size={20} aria-hidden="true" />เลเวลของฉัน</NavLink>
          <NavLink to="/profile" onClick={() => setOpen(false)}><UserRound size={20} aria-hidden="true" />My Profile</NavLink>
          <NavLink to="/buddies" onClick={() => setOpen(false)}><Users size={20} aria-hidden="true" />My Buddy</NavLink>
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
