import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Flame, MapPin, Target, UserRound } from 'lucide-react';
import PageShell from '../components/common/PageShell';
import InitialAvatar from '../components/common/InitialAvatar';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMyLevel } from '../hooks/useMyLevel';
import { MOCK_MEMBERS } from '../data/mockMembers';
import { cancelBuddyRequest, readBuddyStatuses, requestBuddy, type BuddyStatus } from '../services/buddyRepository';
import { matchProfileFrom, rankBuddies, type BuddyMatch } from '../utils/buddyMatching';
import { LEVELS } from '../utils/leveling';
import '../styles/buddies.css';

const levelLabel = (id: string) => LEVELS.find(level => level.id === id)?.label ?? id;

function BuddyCard({ match, status, busy, onRequest, onCancel }: {
  match: BuddyMatch;
  status?: BuddyStatus;
  busy: boolean;
  onRequest: () => void;
  onCancel: () => void;
}) {
  const { member, score, reasons } = match;
  return (
    <article className="buddy-card">
      <div className="buddy-card-head">
        <InitialAvatar id={member.id} name={member.displayName} size="lg" />
        <div className="buddy-card-name">
          <h2>{member.displayName}</h2>
          <span className="level-chip" data-level={member.levelId}>{levelLabel(member.levelId)}</span>
        </div>
        <div className="buddy-score" style={{ '--score': score } as React.CSSProperties} role="img" aria-label={`เข้ากัน ${score}%`}>
          <span>{score}%</span>
        </div>
      </div>

      <p className="buddy-goal"><Target size={15} aria-hidden="true" /> {member.goalLabel}</p>
      {reasons.length > 0 && (
        <ul className="buddy-reasons" aria-label="เหตุผลที่เข้ากัน">
          {reasons.map(reason => <li key={reason}><Check size={13} aria-hidden="true" />{reason}</li>)}
        </ul>
      )}
      <p className="buddy-bio">{member.bio}</p>

      <div className="buddy-actions">
        {status === 'buddy' ? (
          <>
            <span className="buddy-status is-buddy"><Check size={16} aria-hidden="true" /> เป็นบัดดี้แล้ว</span>
            <Link to={`/parties/new?buddy=${member.id}`} className="btn btn-primary btn-md btn-cta"><Flame size={16} /> ชวนเข้าตี้</Link>
          </>
        ) : status === 'pending' ? (
          <>
            <span className="buddy-status"><Clock size={16} aria-hidden="true" /> รอ {member.displayName} ตอบรับ</span>
            <button type="button" className="btn btn-secondary btn-md" onClick={onCancel}>ยกเลิกคำขอ</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-primary btn-md btn-cta" disabled={busy} onClick={onRequest}>{busy ? 'กำลังส่ง…' : 'ขอเป็นบัดดี้'}</button>
            <Link to={`/users/${member.id}`} className="btn btn-secondary btn-md"><UserRound size={16} /> ดูโปรไฟล์</Link>
          </>
        )}
      </div>
    </article>
  );
}

export default function Buddies() {
  useDocumentTitle('บัดดี้ | Lowrox');
  const { user } = useAuth();
  const { summary } = useMyLevel();
  const [statuses, setStatuses] = useState(() => (user ? readBuddyStatuses(user.id) : {}));
  const [busyId, setBusyId] = useState('');
  const [tab, setTab] = useState<'suggested' | 'mine'>('suggested');
  const [toast, setToast] = useState('');
  const dismissToast = useCallback(() => setToast(''), []);

  const me = useMemo(() => matchProfileFrom(summary?.level.id ?? null, user?.onboardingData), [summary, user]);
  const matches = useMemo(() => rankBuddies(me, MOCK_MEMBERS), [me]);
  const myBuddies = matches.filter(match => statuses[match.member.id]);
  const shown = tab === 'mine' ? myBuddies : matches;
  const timeCount = new Set(me.timePresets).size;

  const request = async (match: BuddyMatch) => {
    if (!user) return;
    setBusyId(match.member.id);
    try {
      const next = await requestBuddy(user.id, match.member);
      setStatuses(next);
      setToast(next[match.member.id] === 'buddy'
        ? `${match.member.displayName} ตอบรับแล้ว! ชวนเข้าตี้ได้เลย`
        : `ส่งคำขอถึง ${match.member.displayName} แล้ว`);
    } catch {
      setToast('ส่งคำขอไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setBusyId('');
    }
  };

  return (
    <PageShell className="buddies-page">
      <div className="page-container buddies">
        <header className="buddies-head">
          <h1 className="heading-2">บัดดี้ที่เข้ากับคุณ</h1>
          <p>เราจับคู่จากเลเวล เป้าหมาย เวลาว่าง และพื้นที่ที่คุณบอกไว้ เรียงจากเข้ากันมากที่สุด</p>
          <ul className="buddies-basis" aria-label="ข้อมูลที่ใช้จับคู่">
            <li><span className="level-chip" data-level={summary?.level.id}>{summary ? summary.level.label : 'ยังไม่มีเลเวล'}</span></li>
            <li><Clock size={15} aria-hidden="true" /> {timeCount ? `เวลาที่สะดวก ${timeCount} ช่วง` : 'ยังไม่ระบุเวลา'}</li>
            <li><MapPin size={15} aria-hidden="true" /> {me.areaLabels[0] || 'ยังไม่ระบุพื้นที่'}</li>
            <li><Link to="/profile/onboarding">แก้ไข</Link></li>
          </ul>
        </header>

        <div className="buddies-tabs" role="group" aria-label="มุมมอง">
          <button type="button" className={`onboarding-pill-button${tab === 'suggested' ? ' selected' : ''}`} aria-pressed={tab === 'suggested'} onClick={() => setTab('suggested')}>แนะนำ ({matches.length})</button>
          <button type="button" className={`onboarding-pill-button${tab === 'mine' ? ' selected' : ''}`} aria-pressed={tab === 'mine'} onClick={() => setTab('mine')}>บัดดี้ของฉัน ({myBuddies.length})</button>
        </div>

        {shown.length === 0 ? (
          <div className="buddies-empty">
            <p>ยังไม่มีบัดดี้ ลองกด "ขอเป็นบัดดี้" กับคนที่เข้ากับคุณดูนะ</p>
            <button type="button" className="btn btn-primary btn-md btn-cta" onClick={() => setTab('suggested')}>ดูบัดดี้ที่แนะนำ</button>
          </div>
        ) : (
          <div className="buddies-grid">
            {shown.map(match => (
              <BuddyCard
                key={match.member.id}
                match={match}
                status={statuses[match.member.id]}
                busy={busyId === match.member.id}
                onRequest={() => request(match)}
                onCancel={() => user && setStatuses(cancelBuddyRequest(user.id, match.member.id))}
              />
            ))}
          </div>
        )}
      </div>
      <Toast message={toast} onDismiss={dismissToast} />
    </PageShell>
  );
}
