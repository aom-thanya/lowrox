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
            <Link to="/" className="logo" aria-label="Lowrox homepage">
              <img src={logoImg} alt="LOWROX" className="h-8" />
            </Link>
            <p className="body-sm footer-desc">ประเมินระดับ วางแผนฝึก และหาเพื่อนซ้อมที่เหมาะกับคุณ</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to="/privacy" className="nav-link">นโยบายความเป็นส่วนตัว</Link>
            <Link to="/terms" className="nav-link">ข้อกำหนดการใช้งาน</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="caption">© <span id="current-year">{currentYear}</span> LOWROX</p>
        </div>
      </div>
    </footer>
  );
}
