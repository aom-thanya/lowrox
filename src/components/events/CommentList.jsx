import React, { useState } from 'react';
import CommentGallery from './CommentGallery';
import { Link } from 'react-router-dom';
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
  const [gallery, setGallery] = useState(null);
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
      {gallery && <CommentGallery images={gallery.images} initialIndex={gallery.index} returnFocus={gallery.trigger} onClose={() => setGallery(null)} />}
      {comments.map(comment => (
        <div key={comment.id} className="event-comment-item">
          <Link to={`/users/${comment.userId}`} className="public-member-avatar" aria-label={`ดูโปรไฟล์ ${comment.userDisplayName}`}><Avatar src={comment.userAvatarUrl} size="small" className="flex-shrink-0" /></Link>
          <div className="event-comment-content">
            <div className="event-comment-meta">
              <Link to={`/users/${comment.userId}`} className="public-member-link font-medium">{comment.userDisplayName}</Link>
              <span className="text-xs text-neutral-500">{formatCommentDate(comment.createdAt)}</span>
            </div>
            {comment.message && <p className="event-detail-copy">{comment.message}</p>}
            {!!comment.images?.length && <div className="comment-image-gallery">{comment.images.map((image, index) => <button key={image.id || index} type="button" className="comment-image-open" aria-label={`ดูรูป ${index + 1} จาก ${comment.userDisplayName}`} onClick={event => setGallery({ images: comment.images, index, trigger: event.currentTarget })}><img src={image.url} alt={`รูปแนบ ${index + 1} จาก ${comment.userDisplayName}`} width={image.width} height={image.height} loading="lazy" /></button>)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
