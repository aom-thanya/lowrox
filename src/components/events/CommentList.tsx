import type { CommentRecord, CommentImage } from '../../types/models';
import React, { useEffect, useRef, useState } from 'react';
import Image from '../common/Image';
import CommentGallery from './CommentGallery';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { formatDateTimeShort, formatTimeAgo } from '../../utils/formatDate';

// Varied line widths so the placeholder reads like real comments.
const SKELETON_ROWS = [['85%', '60%'], ['70%'], ['90%', '45%']];

export default function CommentList({ comments, isLoading }: { comments: CommentRecord[]; isLoading: boolean }) {
  const [gallery, setGallery] = useState<{ images: CommentImage[]; index: number; trigger: HTMLButtonElement } | null>(null);
  // Re-render every minute so "5 mins ago" keeps counting.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  // Comments on screen when loading finished fade in together; any that arrive
  // later (auto refresh or your own post) also get a short highlight.
  const initialIds = useRef<Set<string> | null>(null);
  if (isLoading) initialIds.current = null;
  else if (initialIds.current === null) initialIds.current = new Set(comments.map(comment => String(comment.id)));

  if (isLoading) {
    return (
      <div className="event-comment-list" role="status" aria-label="กำลังโหลดความคิดเห็น">
        {SKELETON_ROWS.map((widths, i) => (
          <div key={i} className="event-comment-item event-comment-skeleton" aria-hidden="true">
            <span className="comment-skeleton-avatar" />
            <div className="event-comment-content">
              <span className="comment-skeleton-line is-name" />
              {widths.map((width, line) => <span key={line} className="comment-skeleton-line" style={{ width }} />)}
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
      {comments.map((comment, index) => (
        <div key={comment.id} className={`event-comment-item is-entering${initialIds.current?.has(String(comment.id)) ? '' : ' is-new'}`} style={{ '--enter-delay': `${Math.min(index, 5) * 40}ms` } as React.CSSProperties}>
          <Link to={`/users/${comment.userId}`} className="public-member-avatar" aria-label={`ดูโปรไฟล์ ${comment.userDisplayName}`}><Avatar src={comment.userAvatarUrl} size="small" className="shrink-0" /></Link>
          <div className="event-comment-content">
            <div className="event-comment-meta">
              <Link to={`/users/${comment.userId}`} className="public-member-link font-medium">{comment.userDisplayName}</Link>
              <time className="event-comment-time text-xs text-neutral-500" dateTime={comment.createdAt} title={formatDateTimeShort(comment.createdAt)}>{formatTimeAgo(comment.createdAt, now)}</time>
            </div>
            {comment.message && <p className="event-detail-copy">{comment.message}</p>}
            {!!comment.images?.length && <div className="comment-image-gallery">{comment.images.map((image, index) => <button key={image.id || index} type="button" className="comment-image-open" aria-label={`ดูรูป ${index + 1} จาก ${comment.userDisplayName}`} onClick={event => setGallery({ images: comment.images!, index, trigger: event.currentTarget })}><Image src={image.url} alt={`รูปแนบ ${index + 1} จาก ${comment.userDisplayName}`} width={image.width} height={image.height} /></button>)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
