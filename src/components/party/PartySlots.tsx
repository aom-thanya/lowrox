import React from 'react';
import { Plus } from 'lucide-react';
import type { PartyParticipant } from '../../types/models';
import InitialAvatar from '../common/InitialAvatar';
import '../../styles/party.css';

// Joined members followed by open seats, e.g. 3/4 · เหลือ 1 ที่.
export default function PartySlots({ participants, capacity, showNames = false }: { participants: PartyParticipant[]; capacity: number; showNames?: boolean }) {
  const open = Math.max(0, capacity - participants.length);
  return (
    <div className="party-slots">
      <div className="party-slot-row">
        {participants.map(person => (
          <span key={person.id} className="party-slot" title={person.name}>
            <InitialAvatar id={person.id} name={person.name} />
            {showNames && <small>{person.name}</small>}
          </span>
        ))}
        {Array.from({ length: open }, (_, index) => (
          <span key={`open-${index}`} className="party-slot">
            <span className="party-slot-open" aria-hidden="true"><Plus size={16} /></span>
            {showNames && <small>ว่าง</small>}
          </span>
        ))}
      </div>
      <p className="party-slot-count">
        {participants.length}/{capacity} คน · {open ? `เหลือ ${open} ที่` : 'เต็มแล้ว'}
      </p>
    </div>
  );
}
