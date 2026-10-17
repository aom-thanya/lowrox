import React from 'react';
import { Flame, Handshake, ShieldCheck, TrendingUp } from 'lucide-react';
import Sparkles from './Sparkles';

const HERO_SPARKLES = [
  { top: '2%', left: '12%', size: 18, delay: 0 },
  { top: '14%', left: '88%', size: 14, delay: 0.8 },
  { top: '46%', left: '-2%', size: 12, delay: 1.6 },
  { top: '78%', left: '92%', size: 20, delay: 0.4 },
  { top: '92%', left: '22%', size: 12, delay: 1.2 },
  { top: '30%', left: '70%', size: 10, delay: 2 },
];

// Illustrative product preview for the hero. Sample data only, so it is hidden from assistive tech.
export default function HeroLevelCard() {
  return (
    <div className="home-hero-stage" aria-hidden="true">
      <div className="home-hero-glow" />
      <Sparkles points={HERO_SPARKLES} />

      <div className="home-level-card">
        <div className="home-level-card-head">
          <span className="home-level-avatar">ม</span>
          <div>
            <strong>มายด์</strong>
            <span>สถิติล่าสุด · วิ่ง 5 กม.</span>
          </div>
          <span className="home-level-badge">Intermediate</span>
        </div>

        <div className="home-level-metrics">
          <div><b>5</b><small>กม.</small></div>
          <div><b>52:30</b><small>นาที</small></div>
          <div><b>10:30</b><small>/กม.</small></div>
        </div>

        <div className="home-level-progress">
          <div className="home-level-progress-label">
            <span><TrendingUp size={14} /> เป้าหมายถัดไป</span>
            <b>5 กม. ใน 40 นาที</b>
          </div>
          <div className="home-level-bar"><i /></div>
          <div className="home-level-scale"><span>Beginner</span><span>Intermediate</span><span>Advanced</span></div>
        </div>
      </div>

      <div className="home-float-chip chip-party"><Flame size={16} /> ตี้ HYROX Doubles เหลือ 1 ที่</div>
      <div className="home-float-chip chip-match"><Handshake size={16} /> Buddy เลเวลเดียวกัน 92%</div>
      <div className="home-float-chip chip-safety"><ShieldCheck size={16} /> Safety check ผ่านแล้ว</div>
    </div>
  );
}
