import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Activity } from 'lucide-react';
import ContentCard from '../common/ContentCard';
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

export default function EventCard({ event }) {
  return (
    <ContentCard className="event-list-card">
      <div className="event-list-card-cover">
        {/* Placeholder image for events */}
        <div className="event-list-card-placeholder">
          <Activity size={48} />
        </div>
        {event.status === 'cancelled' && (
          <div className="event-list-card-status">
            <Badge variant="error">ยกเลิก</Badge>
          </div>
        )}
      </div>
      
      <div className="event-list-card-body">
        <div className="event-list-card-badge">
          <Badge variant="neutral">{event.type}</Badge>
        </div>
        
        <h2 className="heading-4 event-list-card-title text-clamp-2">{event.title}</h2>
        
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
        
        <p className="body-sm event-list-card-description text-clamp-2">
          {event.description}
        </p>
        
        <Link 
          to={`/events/${event.id}`} 
          className="btn btn-secondary btn-md event-list-card-action"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </ContentCard>
  );
}
