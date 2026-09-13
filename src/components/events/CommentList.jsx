import React from 'react';
import Avatar from '../common/Avatar';

function formatCommentDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function CommentList({ comments, isLoading }) {
  if (isLoading) {
    return (
      <div className="event-comment-list">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0"></div>
            <div className="flex-grow flex flex-col gap-8">
              <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="event-comment-empty">
        ยังไม่มีความคิดเห็น เป็นคนแรกที่เริ่มพูดคุยสิ
      </div>
    );
  }

  return (
    <div className="event-comment-list">
      {comments.map(comment => (
        <div key={comment.id} className="event-comment-item">
          <Avatar src={comment.userAvatarUrl} size="small" className="flex-shrink-0" />
          <div className="event-comment-content">
            <div className="event-comment-meta">
              <span className="font-medium text-neutral-900">{comment.userDisplayName}</span>
              <span className="text-xs text-neutral-500">{formatCommentDate(comment.createdAt)}</span>
            </div>
            <p className="event-detail-copy">{comment.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
