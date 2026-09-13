import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import ConversationItem from './ConversationItem';
import Skeleton from '../common/Skeleton';

export default function ConversationList({ groups, isLoading, activeGroupId, onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = query
    ? groups.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
    : groups;

  return (
    <aside className="msg-sidebar">
      <div className="msg-sidebar-header">
        <h2 className="heading-4">ข้อความ</h2>
      </div>

      <div className="msg-sidebar-search">
        <div className="msg-search-input">
          <Search size={18} className="msg-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="form-control"
            placeholder="ค้นหากลุ่ม..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="msg-sidebar-list" role="listbox" aria-label="รายการแชท">
        {isLoading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="msg-conversation-skeleton">
                <Skeleton className="msg-skeleton-avatar" />
                <div className="msg-skeleton-text">
                  <Skeleton className="msg-skeleton-line-short" />
                  <Skeleton className="msg-skeleton-line-long" />
                </div>
              </div>
            ))}
          </>
        ) : groups.length === 0 ? (
          <div className="msg-empty-state">
            <MessageSquare size={40} />
            <p>คุณยังไม่ได้เข้าร่วมกลุ่มกิจกรรม</p>
            <Link to="/events" className="btn btn-primary btn-md">ดูกิจกรรม</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="msg-empty-state">
            <p>ไม่พบกลุ่มที่ค้นหา</p>
          </div>
        ) : (
          filtered.map(group => (
            <ConversationItem
              key={group.id}
              group={group}
              isActive={group.id === activeGroupId}
              onClick={() => onSelect(group.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
