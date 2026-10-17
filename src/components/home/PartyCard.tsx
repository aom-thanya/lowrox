import React from 'react';
import { CalendarDays, MapPin, Plus } from 'lucide-react';

const MEMBERS = ['ต', 'บ', 'J'];

// Illustrative "หัวตี้" card: members pop in one by one, the open slot pulses.
// Sample data only, so it is hidden from assistive tech.
export default function PartyCard() {
  return (
    <div className="home-party-card" aria-hidden="true">
      <div className="home-party-top">
        <span className="home-party-host">หัวตี้ · ต้น</span>
        <span className="home-level-badge">Intermediate</span>
      </div>
      <h3>HYROX Doubles ซ้อมสถานีหนัก</h3>
      <p className="home-party-meta"><CalendarDays size={15} /> เสาร์ 07:00</p>
      <p className="home-party-meta"><MapPin size={15} /> สวนลุมพินี</p>

      <div className="home-party-slots">
        {MEMBERS.map((initial, index) => (
          <span key={initial} className="home-party-avatar" style={{ animationDelay: `${0.3 + index * 0.35}s` }}>{initial}</span>
        ))}
        <span className="home-party-open"><Plus size={18} /></span>
        <span className="home-party-count">3/4 · เหลือ 1 ที่</span>
      </div>

      <span className="home-party-join">จอยตี้นี้</span>
    </div>
  );
}
