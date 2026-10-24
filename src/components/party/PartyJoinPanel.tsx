import React, { useState } from 'react';
import { Check, Crown } from 'lucide-react';
import type { EventRecord } from '../../types/models';
import { useAuth } from '../../context/AuthContext';
import { useMyLevel } from '../../hooks/useMyLevel';
import { cancelParty, joinParty, leaveParty, participantFrom } from '../../services/partyRepository';
import { partyLevelLabel as levelLabel } from '../../utils/leveling';
import PartySlots from './PartySlots';

// In-app join for a party: one tap to join or leave; the host can cancel.
export default function PartyJoinPanel({ event, isActive, onChange, onRequireLogin }: {
  event: EventRecord;
  isActive: boolean;
  onChange: (event: EventRecord) => void;
  onRequireLogin: () => void;
}) {
  const { user } = useAuth();
  const { summary } = useMyLevel();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const participants = event.participants ?? [];
  const capacity = event.capacity ?? participants.length;
  const isHost = Boolean(user && String(user.id) === String(event.hostUserId));
  const joined = Boolean(user && participants.some(person => String(person.id) === String(user.id)));
  const full = participants.length >= capacity;
  const levelMismatch = Boolean(summary && event.levelId && event.levelId !== 'all' && event.levelId !== summary.level.id);

  const run = async (action: () => Promise<EventRecord>, failure: string) => {
    setBusy(true);
    setError('');
    try { onChange(await action()); } catch { setError(failure); } finally { setBusy(false); }
  };

  const join = () => {
    if (!user) { onRequireLogin(); return; }
    run(() => joinParty(event, participantFrom(user, summary?.level.id)), 'จอยตี้ไม่สำเร็จ ตี้อาจเต็มแล้ว ลองรีเฟรชดูอีกครั้ง');
  };

  return (
    <div className="party-panel">
      <div className="party-panel-head">
        <span className="level-chip" data-level={event.levelId ?? 'all'}>{levelLabel(event.levelId)}</span>
        <span className="party-panel-host">หัวตี้: {event.organizer.name}</span>
      </div>

      <PartySlots participants={participants} capacity={capacity} showNames />

      {!isActive ? (
        <p className="party-panel-note">ตี้นี้จบหรือถูกยกเลิกแล้ว</p>
      ) : isHost ? (
        <div className="party-panel-actions">
          <p className="party-panel-badge"><Crown size={16} aria-hidden="true" /> คุณเป็นหัวตี้</p>
          <button type="button" className="btn btn-secondary btn-md" disabled={busy} onClick={() => run(() => cancelParty(event, user!.id), 'ยกเลิกตี้ไม่สำเร็จ กรุณาลองอีกครั้ง')}>ยกเลิกตี้</button>
        </div>
      ) : joined ? (
        <div className="party-panel-actions">
          <p className="party-panel-badge is-joined"><Check size={16} aria-hidden="true" /> คุณจอยตี้นี้แล้ว</p>
          <button type="button" className="btn btn-secondary btn-md" disabled={busy} onClick={() => run(() => leaveParty(event, user!.id), 'ออกจากตี้ไม่สำเร็จ กรุณาลองอีกครั้ง')}>ออกจากตี้</button>
        </div>
      ) : (
        <div className="party-panel-actions">
          {levelMismatch && <p className="party-panel-note">ตี้นี้สำหรับ {levelLabel(event.levelId)} ส่วนคุณอยู่ {summary!.level.label} จอยได้ แต่ความหนักอาจไม่พอดี</p>}
          <button type="button" className="btn btn-primary btn-md btn-cta party-join-btn" disabled={busy || full} onClick={join}>
            {full ? 'ตี้เต็มแล้ว' : busy ? 'กำลังจอย…' : user ? 'จอยตี้นี้' : 'เข้าสู่ระบบเพื่อจอยตี้'}
          </button>
        </div>
      )}
      {error && <p className="party-panel-error" role="alert">{error}</p>}
    </div>
  );
}
