import React, { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import type { EventRecord } from '../../types/models';
import { buildPartyShareText, shareText } from '../../utils/partyShare';

// Shares the invite as one block of text with the link inside, so it pastes the same into LINE, IG or a group chat.
export function usePartyShare(event: EventRecord) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const share = async () => {
    setError('');
    try {
      if (await shareText(buildPartyShareText(event, `${window.location.origin}/events/${event.id}`)) !== 'copied') return;
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('คัดลอกไม่สำเร็จ ลองคัดลอกลิงก์จากแถบที่อยู่แทนนะ');
    }
  };
  return { share, copied, error };
}

export default function PartyShareButton({ event, className = '', compact = false }: { event: EventRecord; className?: string; compact?: boolean }) {
  const { share, copied, error } = usePartyShare(event);

  if (compact) {
    return (
      <button type="button" className={`btn btn-secondary btn-md shrink-0 gap-2 px-4 ${className}`} onClick={share}
        aria-label={copied ? 'คัดลอกข้อความชวนแล้ว' : `แชร์ตี้ ${event.title}`} title={error || (copied ? 'คัดลอกแล้ว ไปแปะได้เลย!' : 'แชร์ตี้')}>
        {copied ? <><Check size={18} aria-hidden="true" /> คัดลอกแล้ว</> : <><Share2 size={18} aria-hidden="true" /> แชร์</>}
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <button type="button" className={`btn btn-secondary btn-md gap-2 ${className}`} onClick={share}>
        {copied ? <><Check size={18} aria-hidden="true" /> คัดลอกข้อความชวนแล้ว ไปแปะได้เลย!</> : <><Share2 size={18} aria-hidden="true" /> แชร์ตี้ชวนเพื่อน</>}
      </button>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
    </div>
  );
}
