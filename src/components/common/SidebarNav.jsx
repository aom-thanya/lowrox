import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarNav({ items, label }) {
  return (
    <nav className="sidebar-nav" aria-label={label}>
      <p className="sidebar-nav-title heading-4">{label}</p>
      <ul className="sidebar-nav-list">
        {items.map(({ to, label: itemLabel, icon: Icon }) => (
          <li key={to}>
            <NavLink to={to} end className={({ isActive }) => `sidebar-nav-link${isActive ? ' is-active' : ''}`}>
              {Icon && <Icon size={20} aria-hidden="true" />}
              <span>{itemLabel}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
