import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Users } from 'lucide-react';
import Avatar from '../common/Avatar';

export default function ChatHeader({ group, memberCount, onBack }) {
  return (
    <div className="msg-chat-header">
      {onBack && (
        <button type="button" className="msg-back-btn" onClick={onBack} aria-label="กลับรายการแชท">
          <ArrowLeft size={20} />
        </button>
      )}

      <Avatar src={group.imageUrl} name={group.name} size="small" />

      <div className="msg-chat-header-info">
        <h3 className="msg-chat-header-name">{group.name}</h3>
        {memberCount > 0 && (
          <span className="msg-chat-header-members">
            <Users size={14} aria-hidden="true" />
            {memberCount} สมาชิก
          </span>
        )}
      </div>

      {group.eventId && (
        <Link
          to={`/events/${group.eventId}`}
          className="btn btn-secondary btn-sm msg-chat-header-event"
        >
          ดูกิจกรรม <ExternalLink size={14} />
        </Link>
      )}
    </div>
  );
}
