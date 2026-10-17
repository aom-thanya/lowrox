import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, Lock, PlayCircle, ShieldAlert } from 'lucide-react';
import type { PlanSession } from '../../utils/trainingPlan';

// Free members get the first session; the rest unlock with Member.
export default function WeeklyPlan({ sessions, doneIds, isMember, hasHealthConcerns, onToggle }: {
  sessions: PlanSession[];
  doneIds: string[];
  isMember: boolean;
  hasHealthConcerns: boolean;
  onToggle: (sessionId: string) => void;
}) {
  const doneCount = sessions.filter(session => doneIds.includes(session.id)).length;

  return (
    <section className="level-section" aria-labelledby="plan-heading">
      <div className="level-section-head">
        <h2 id="plan-heading" className="heading-4">แผนซ้อมสัปดาห์นี้</h2>
        <span className="plan-count">{doneCount}/{sessions.length} เสร็จแล้ว</span>
      </div>

      {hasHealthConcerns && (
        <p className="plan-safety"><ShieldAlert size={18} aria-hidden="true" /> เราปรับแผนให้เบาลง เพราะคุณแจ้งข้อจำกัดด้านสุขภาพไว้ ถ้าไม่แน่ใจ ปรึกษาแพทย์ก่อนเพิ่มความหนัก</p>
      )}

      <ul className="plan-list">
        {sessions.map((session, index) => {
          const locked = !isMember && index > 0;
          const done = doneIds.includes(session.id);
          return (
            <li key={session.id} className={`plan-item${done ? ' is-done' : ''}${locked ? ' is-locked' : ''}`}>
              <button
                type="button"
                className="plan-check"
                aria-pressed={done}
                aria-label={`${done ? 'ยกเลิกเครื่องหมายเสร็จ' : 'ทำเครื่องหมายว่าเสร็จ'}: ${session.title}`}
                disabled={locked}
                onClick={() => onToggle(session.id)}
              >
                {locked ? <Lock size={16} /> : <Check size={18} />}
              </button>
              <div className="plan-body">
                <p className="plan-title">
                  {session.title}
                  <span className={`plan-intensity is-${session.intensity}`}>{session.intensity === 'hard' ? 'หนัก' : 'เบา'}</span>
                </p>
                {locked ? (
                  <p className="plan-detail">รายละเอียด, pace และคลิปสอน สำหรับ Member</p>
                ) : (
                  <>
                    <p className="plan-detail">{session.detail}</p>
                    {session.paceHint && <p className="plan-pace">Pace {session.paceHint}</p>}
                    <a className="plan-video" href={session.videoUrl} target="_blank" rel="noopener noreferrer"><PlayCircle size={16} aria-hidden="true" /> ดูคลิปตัวอย่าง</a>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!isMember && (
        <Link to="/#plans" className="plan-upgrade"><Crown size={18} aria-hidden="true" /> ปลดล็อกแผนซ้อมเต็มด้วย Member</Link>
      )}
      <p className="plan-warning">หยุดซ้อมทันทีถ้ามีอาการเจ็บหน้าอก หน้ามืด หรือหายใจไม่ทัน</p>
    </section>
  );
}
