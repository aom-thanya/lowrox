import type { EventRecord } from '../../types/models';
import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../common/Image';
import { MapPin, Calendar, Activity } from 'lucide-react';
import ContentCard from '../common/ContentCard';
import PartyAvatar from '../party/PartyAvatar';
import PartyShareButton from '../party/PartyShareButton';
import { eventStatusLabel } from '../../utils/eventVisibility';
import Badge from '../common/Badge';
import { formatDateTimeShort } from '../../utils/formatDate';
import { LEVELS } from '../../utils/leveling';
import { coverFor } from '../../utils/partyCover';

export default function EventCard({ event, navigationState, onNavigate }: { event: EventRecord; navigationState?: Record<string, unknown>; onNavigate?: () => void }) {
  const cover = coverFor(event);
  return (
    <ContentCard className="event-list-card">
      <Link to={`/events/${event.id}`} state={navigationState} onClick={onNavigate} className="event-list-card-cover" aria-label={`ดูรายละเอียด ${event.title}`}>
        {/* Placeholder image for events */}
        {cover ? <Image className="event-list-cover-image" src={cover} alt="" /> : <div className="event-list-card-placeholder">
          <Activity size={48} />
        </div>}
        <div className="event-list-card-status"><Badge variant={event.status === 'cancelled' ? 'error' : 'neutral'}>{eventStatusLabel(event)}</Badge></div>
      </Link>
      
      <div className="event-list-card-body">
        {event.isParty && <PartyAvatar style={event.style} className="-mt-[52px]" />}
        <div className="event-list-card-badge">
          <Badge variant="neutral">{event.type}</Badge>
          {event.isParty && <span className="level-chip" data-level={event.levelId ?? 'all'}>{event.levelId && event.levelId !== 'all' ? LEVELS.find(level => level.id === event.levelId)?.label : 'ทุกเลเวล'}</span>}
        </div>
        
        <h2 className="heading-4 event-list-card-title line-clamp-2"><Link to={`/events/${event.id}`} state={navigationState} onClick={onNavigate}>{event.title}</Link></h2>
        
        <div className="event-list-card-meta">
          <div className="event-list-card-meta-row">
            <Calendar size={16} className="event-list-card-icon" />
            <span>{formatDateTimeShort(event.date)}</span>
          </div>
          <div className="event-list-card-meta-row">
            <MapPin size={16} className="event-list-card-icon" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
        
        {Number.isFinite(event.participantCount) && <p className="text-sm text-neutral-600">ผู้เข้าร่วม {event.participantCount}{Number.isFinite(event.capacity) ? ` / ${event.capacity}` : ''} คน</p>}
        <p className="body-sm event-list-card-description line-clamp-2">
          {event.description}
        </p>
        
        <div className="mt-auto flex gap-2">
          <Link
            to={`/events/${event.id}`} state={navigationState} onClick={onNavigate}
            className="btn btn-secondary btn-md event-list-card-action flex-1"
          >
            ดูรายละเอียด
          </Link>
          {event.isParty && event.status !== 'cancelled' && <PartyShareButton event={event} compact />}
        </div>
      </div>
    </ContentCard>
  );
}
