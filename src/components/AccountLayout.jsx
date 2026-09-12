import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SidebarNav from './common/SidebarNav';

export default function AccountLayout({ items, label }) {
  return (
    <div className="account-layout flex flex-col min-h-screen">
      <Header />
      <div className="account-container container">
        <SidebarNav items={items} label={label} />
        <main className="account-content"><Outlet /></main>
      </div>
      <Footer />
    </div>
  );
}
