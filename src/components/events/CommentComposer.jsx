import React, { useState } from 'react';
import Avatar from '../common/Avatar';

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
    <div className="flex gap-4 mt-6">
      <Avatar src={user.avatarUrl} size="small" className="flex-shrink-0 hidden md:block" />
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col items-end gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="เพิ่มความคิดเห็น..."
          className="w-full bg-neutral-100 border-none rounded-xl px-4 py-3 min-h-[100px] resize-y focus:ring-2 focus:ring-brand-500"
          disabled={isSubmitting}
          maxLength={1000}
        />
        {error && (
          <div className="w-full text-sm text-error text-left">{error}</div>
        )}
        <button 
          type="submit" 
          className="btn btn-primary btn-sm"
          disabled={!message.trim() || isSubmitting}
        >
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
        </button>
      </form>
    </div>
  );
}
