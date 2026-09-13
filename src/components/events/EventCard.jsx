import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Activity } from 'lucide-react';
import ContentCard from '../common/ContentCard';
import { eventStatusLabel } from '../../utils/eventVisibility';
import Badge from '../common/Badge';

function formatEventDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function EventCard({ event, navigationState, onNavigate }) {
  return (
    <ContentCard className="event-list-card">
      <Link to={`/events/${event.id}`} state={navigationState} onClick={onNavigate} className="event-list-card-cover" aria-label={`ดูรายละเอียด ${event.title}`}>
        {/* Placeholder image for events */}
        {event.coverUrl ? <img className="event-list-cover-image" src={event.coverUrl} alt="" /> : <div className="event-list-card-placeholder">
          <Activity size={48} />
        </div>}
        <div className="event-list-card-status"><Badge variant={event.status === 'cancelled' ? 'error' : 'neutral'}>{eventStatusLabel(event)}</Badge></div>
      </Link>
      
      <div className="event-list-card-body">
        <div className="event-list-card-badge">
          <Badge variant="neutral">{event.type}</Badge>
        </div>
        
        <h2 className="heading-4 event-list-card-title text-clamp-2"><Link to={`/events/${event.id}`} state={navigationState} onClick={onNavigate}>{event.title}</Link></h2>
        
        <div className="event-list-card-meta">
          <div className="event-list-card-meta-row">
            <Calendar size={16} className="event-list-card-icon" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="event-list-card-meta-row">
            <MapPin size={16} className="event-list-card-icon" />
            <span className="text-clamp-1">{event.location}</span>
          </div>
        </div>
        
        {Number.isFinite(event.participantCount) && <p className="text-sm text-neutral-600">ผู้เข้าร่วม {event.participantCount}{Number.isFinite(event.capacity) ? ` / ${event.capacity}` : ''} คน</p>}
        <p className="body-sm event-list-card-description text-clamp-2">
          {event.description}
        </p>
        
        <Link 
          to={`/events/${event.id}`} state={navigationState} onClick={onNavigate}
          className="btn btn-secondary btn-md event-list-card-action"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </ContentCard>
  );
}
