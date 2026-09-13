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
    <ContentCard className="h-full flex flex-col">
      <div className="relative w-full bg-neutral-100 rounded-t-xl overflow-hidden event-card-image">
        {/* Placeholder image for events */}
        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
          <Activity size={48} />
        </div>
        {event.status === 'cancelled' && (
          <div className="absolute top-2 right-2">
            <Badge variant="error">ยกเลิก</Badge>
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <Badge variant="neutral">{event.type}</Badge>
        </div>
        
        <h3 className="heading-5 mb-3 text-clamp-2">{event.title}</h3>
        
        <div className="mb-4 text-sm text-neutral-600 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-neutral-400 flex-shrink-0" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-neutral-400 flex-shrink-0 mt-0.5" />
            <span className="text-clamp-1">{event.location}</span>
          </div>
        </div>
        
        <p className="body-sm text-neutral-600 mb-6 flex-grow text-clamp-2">
          {event.description}
        </p>
        
        <Link 
          to={`/events/${event.id}`} 
          className="btn btn-secondary btn-md w-full justify-center mt-auto"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </ContentCard>
  );
}
