import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="/" className="logo" aria-label="Lowrox homepage">
              <img src={logoImg} alt="LOWROX" className="h-8" />
            </a>
            <p className="body-sm footer-desc">ประเมินระดับ วางแผนฝึก และหาเพื่อนซ้อมที่เหมาะกับคุณ</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <a href="#" className="nav-link">การประเมินระดับ</a>
            <a href="#" className="nav-link">แผนการซ้อม</a>
            <a href="#" className="nav-link">หาเพื่อนซ้อม</a>
            <Link to="/login" className="nav-link">เข้าสู่ระบบ</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="caption">© <span id="current-year">{currentYear}</span> LOWROX</p>
        </div>
      </div>
    </footer>
  );
}
