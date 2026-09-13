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
      <div className="flex flex-col gap-16 mt-6">
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
      <div className="text-center py-8 text-neutral-500 mt-4">
        ยังไม่มีความคิดเห็น เป็นคนแรกที่เริ่มพูดคุยสิ
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-24 mt-6">
      {comments.map(comment => (
        <div key={comment.id} className="flex gap-4">
          <Avatar src={comment.userAvatarUrl} size="small" className="flex-shrink-0" />
          <div className="flex-grow">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-medium text-neutral-900">{comment.userDisplayName}</span>
              <span className="text-xs text-neutral-500">{formatCommentDate(comment.createdAt)}</span>
            </div>
            <p className="text-neutral-700 whitespace-pre-wrap">{comment.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
