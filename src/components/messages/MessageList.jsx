import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';
import Skeleton from '../common/Skeleton';

function formatDateSeparator(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'วันนี้';
  if (diffDays === 1) return 'เมื่อวาน';

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

export default function MessageList({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  onRetry,
  newMessageCount,
  onScrollToBottom,
  error,
  onErrorRetry
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevScrollHeight = useRef(0);

  // Scroll to bottom on initial load and when user sends a message
  useEffect(() => {
    if (isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages.length, isAtBottom]);

  // Preserve scroll position after loading older messages
  useEffect(() => {
    if (containerRef.current && prevScrollHeight.current > 0) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeight.current;
      if (diff > 0) {
        containerRef.current.scrollTop += diff;
      }
      prevScrollHeight.current = 0;
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 60;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);

    // Load more when scrolled to top
    if (el.scrollTop < 50 && hasMore && !isLoading) {
      prevScrollHeight.current = el.scrollHeight;
      onLoadMore?.();
    }
  }, [hasMore, isLoading, onLoadMore]);

  const handleScrollToBottomClick = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
    onScrollToBottom?.();
  };

  if (error) {
    return (
      <div className="msg-chat-body">
        <div className="msg-empty-state">
          <p>โหลดข้อความไม่สำเร็จ</p>
          <button type="button" className="btn btn-secondary btn-md" onClick={onErrorRetry}>
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="msg-chat-body">
        <div className="msg-messages-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="msg-message-skeleton">
              <Skeleton className="msg-skeleton-avatar" />
              <Skeleton className="msg-skeleton-bubble" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="msg-chat-body">
        <div className="msg-empty-state">
          <MessageSquare size={40} />
          <p>เริ่มทักทายเพื่อนในกลุ่มได้เลย</p>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-chat-body" ref={containerRef} onScroll={handleScroll}>
      {hasMore && (
        <div className="msg-load-more">
          {isLoading ? (
            <span className="msg-loading-text">กำลังโหลด...</span>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onLoadMore}>
              โหลดข้อความเก่า
            </button>
          )}
        </div>
      )}

      {messages.map((msg, idx) => {
        const prev = messages[idx - 1];
        const showDate = !prev || !isSameDay(prev.createdAt, msg.createdAt);

        return (
          <React.Fragment key={msg.id || msg.requestId}>
            {showDate && (
              <div className="msg-date-separator">
                <span>{formatDateSeparator(msg.createdAt)}</span>
              </div>
            )}
            <MessageBubble
              message={msg}
              isMine={msg.senderId === currentUserId}
              onRetry={msg.status === 'failed' ? onRetry : undefined}
            />
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />

      {!isAtBottom && newMessageCount > 0 && (
        <button
          type="button"
          className="msg-new-messages-btn"
          onClick={handleScrollToBottomClick}
        >
          <ChevronDown size={16} />
          ข้อความใหม่ {newMessageCount} รายการ
        </button>
      )}
    </div>
  );
}
