import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="main-content container text-center" style={{ minHeight: '80vh', padding: '120px 0' }}>
        <div className="hero-text">
          <h1 className="display-lg text-orange">Homepage</h1>
          <p className="body-lg" style={{ marginTop: 'var(--space-4)', color: 'var(--color-neutral-600)' }}>
            The energetic, sporty, and fun fitness platform.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
