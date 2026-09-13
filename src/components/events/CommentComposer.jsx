import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import Textarea from '../common/Textarea';

export default function CommentComposer({ user, onSubmit, isSubmitting }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    try {
      setError('');
      await onSubmit(message);
      setMessage('');
    } catch (err) {
      setError('ส่งความคิดเห็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="event-comment-composer">
      <Avatar src={user.avatarUrl} size="small" className="event-comment-avatar" />
      <form onSubmit={handleSubmit} className="event-comment-form">
        <label htmlFor="event-comment" className="event-detail-label">เพิ่มความคิดเห็น</label>
        <Textarea
          id="event-comment"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="เพิ่มความคิดเห็น..."
          className="w-full bg-neutral-100 border-none rounded-xl px-4 py-3 min-h-[100px] resize-y focus:ring-2 focus:ring-brand-500"
          disabled={isSubmitting}
          maxLength={1000}
        />
        {error && (
          <div role="alert" className="event-comment-error">{error}</div>
        )}
        <button 
          type="submit" 
          className="btn btn-primary btn-md"
          disabled={!message.trim() || isSubmitting}
        >
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
        </button>
      </form>
    </div>
  );
}
