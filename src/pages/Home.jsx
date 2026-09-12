import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="main-content container text-center min-h-80vh py-120">
        <div className="hero-text">
          <h1 className="display-lg text-orange">Homepage</h1>
          <p className="body-lg mt-16 text-neutral-600">
            The energetic, sporty, and fun fitness platform.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
