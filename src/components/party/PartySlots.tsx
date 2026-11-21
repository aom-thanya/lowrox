import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { PartyParticipant } from '../../types/models';
import InitialAvatar from '../common/InitialAvatar';
import '../../styles/party.css';

// Profile photo when the member has one, otherwise their colored initial.
function SlotAvatar({ person }: { person: PartyParticipant }) {
  if (person.avatarUrl) return <img className="party-slot-photo" src={person.avatarUrl} alt="" loading="lazy" />;
  return <InitialAvatar id={person.id} name={person.name} />;
}

// Joined members followed by open seats, e.g. 3/4 · เหลือ 1 ที่.
// With linkProfiles, each member opens their public profile.
export default function PartySlots({ participants, capacity, showNames = false, linkProfiles = false }: {
  participants: PartyParticipant[];
  capacity: number;
  showNames?: boolean;
  linkProfiles?: boolean;
}) {
  const open = Math.max(0, capacity - participants.length);
  return (
    <div className="party-slots">
      <div className="party-slot-row">
        {participants.map(person => {
          const content = <>
            <SlotAvatar person={person} />
            {showNames && <small>{person.name}</small>}
          </>;
          return linkProfiles ? (
            <Link key={person.id} to={`/users/${person.id}`} className="party-slot is-link" title={person.name} aria-label={`ดูโปรไฟล์ของ ${person.name}`}>
              {content}
            </Link>
          ) : (
            <span key={person.id} className="party-slot" title={person.name}>{content}</span>
          );
        })}
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
