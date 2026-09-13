import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Avatar from '../common/Avatar';

function formatMessageTime(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export default function MessageBubble({ message, isMine, onRetry }) {
  const isFailed = message.status === 'failed';
  const isSending = message.status === 'sending';

  return (
    <div className={`msg-bubble-row ${isMine ? 'msg-bubble-row-mine' : 'msg-bubble-row-other'}`}>
      {!isMine && (
        <Avatar src={message.senderAvatarUrl} name={message.senderName} size="small" />
      )}

      <div className={`msg-bubble-wrapper ${isMine ? 'msg-bubble-wrapper-mine' : ''}`}>
        {!isMine && (
          <span className="msg-bubble-sender">{message.senderName}</span>
        )}
        <div className={`msg-bubble ${isMine ? 'msg-bubble-mine' : 'msg-bubble-other'}`}>
          <p className="msg-bubble-text">{message.text}</p>
        </div>
        <div className="msg-bubble-meta">
          {isSending && <span className="msg-bubble-status">กำลังส่ง...</span>}
          {isFailed && (
            <span className="msg-bubble-status msg-bubble-failed">
              <AlertCircle size={14} />
              ส่งไม่สำเร็จ
              {onRetry && (
                <button type="button" className="msg-retry-btn" onClick={() => onRetry(message)}>
                  <RotateCcw size={14} /> ลองอีกครั้ง
                </button>
              )}
            </span>
          )}
          {!isSending && !isFailed && (
            <span className="msg-bubble-time">{formatMessageTime(message.createdAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
