import React from 'react';
import Header from '../Header';
import Footer from '../Footer';

// Standard public page frame: site header, main content area, site footer.
// `overlay` renders after the footer, for page-level modals.
export default function PageShell({ children, className = '', overlay }: { children?: React.ReactNode; className?: string; overlay?: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`main-content ${className}`}>{children}</main>
      <Footer />
      {overlay}
    </div>
  );
}
