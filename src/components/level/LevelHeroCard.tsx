import React from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import Sparkles from '../common/Sparkles';
import { LEVELS, formatDuration, type LevelSummary } from '../../utils/leveling';

const CARD_SPARKLES = [
  { top: '8%', left: '88%', size: 16, delay: 0 },
  { top: '70%', left: '94%', size: 12, delay: 1.2 },
  { top: '14%', left: '46%', size: 10, delay: 0.6 },
];

export default function LevelHeroCard({ summary, name, isFirstLevel, onLog }: {
  summary: LevelSummary | null;
  name: string;
  isFirstLevel?: boolean;
  onLog: () => void;
}) {
  if (!summary) {
    return (
      <section className="level-hero is-empty" aria-labelledby="level-heading">
        <Sparkles points={CARD_SPARKLES} />
        <p className="level-hero-eyebrow">สวัสดี {name}</p>
        <h1 id="level-heading" className="level-hero-title">ยังไม่มีเลเวล</h1>
        <p className="level-hero-copy">บันทึกการวิ่งครั้งแรก แล้วเราจะบอกเลเวลของคุณให้ทันที</p>
        <button type="button" className="btn btn-primary btn-md btn-cta level-log-btn" onClick={onLog}><Plus size={18} /> บันทึกการวิ่งครั้งแรก</button>
      </section>
    );
  }

  const { level, next, progress, fiveKMinutes, minutesToNext } = summary;
  return (
    <section className={`level-hero${isFirstLevel ? ' is-first' : ''}`} aria-labelledby="level-heading">
      <Sparkles points={CARD_SPARKLES} />
      <p className="level-hero-eyebrow">{isFirstLevel ? '🎉 นี่คือเลเวลแรกของคุณ' : `สวัสดี ${name}`}</p>
      <h1 id="level-heading" className="level-hero-title">
        <span className="visually-hidden">เลเวลของคุณ: </span>
        <span className="level-hero-badge" data-level={level.id}>{level.label}</span>
      </h1>

      <div className="level-hero-stat">
        <b>{formatDuration(fiveKMinutes)}</b>
        <span>เวลา 5 กม. ที่ดีที่สุดใน 60 วัน (ระยะอื่นแปลงเทียบให้)</span>
      </div>

      <div className="level-hero-progress">
        <div className="level-bar" role="progressbar" aria-label={`ความคืบหน้าในเลเวล ${level.label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <i style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
        <ol className="level-scale" aria-hidden="true">
          {LEVELS.map(item => <li key={item.id} className={item.id === level.id ? 'is-current' : ''}>{item.label}</li>)}
        </ol>
        <p className="level-next">
          <TrendingUp size={16} aria-hidden="true" />
          {next
            ? <>อีก <b>{formatDuration(minutesToNext)}</b> นาทีถึง {next.label} (5 กม. ใน {formatDuration(level.fastest)})</>
            : <>คุณอยู่เลเวลสูงสุดแล้ว รักษาฟอร์มไว้นะ</>}
        </p>
      </div>

      <button type="button" className="btn btn-primary btn-md btn-cta level-log-btn" onClick={onLog}><Plus size={18} /> บันทึกการซ้อม</button>
    </section>
  );
}
