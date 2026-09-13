import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(date);
  }
  if (diffDays === 1) return 'เมื่อวาน';
  if (diffDays < 7) {
    return new Intl.DateTimeFormat('th-TH', { weekday: 'short' }).format(date);
  }
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(date);
}

export default function ConversationItem({ group, isActive, onClick }) {
  const { lastMessage, unreadCount } = group;

  return (
    <button
      type="button"
      className={`msg-conversation-item ${isActive ? 'msg-conversation-active' : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
    >
      <Avatar src={group.imageUrl} name={group.name} size="medium" />
      <div className="msg-conversation-body">
        <div className="msg-conversation-top">
          <span className="msg-conversation-name">{group.name}</span>
          {lastMessage && (
            <span className="msg-conversation-time">{formatTime(lastMessage.createdAt)}</span>
          )}
        </div>
        <div className="msg-conversation-bottom">
          <span className="msg-conversation-preview">
            {lastMessage
              ? `${lastMessage.senderName}: ${lastMessage.text}`
              : 'เริ่มบทสนทนาในกลุ่มได้เลย'}
          </span>
          {unreadCount > 0 && (
            <Badge variant="primary" className="msg-unread-badge">{unreadCount}</Badge>
          )}
        </div>
      </div>
    </button>
  );
}
