import React from 'react';
export default function EmptyState({ children, action }) {
  return <div className="empty-state"><p>{children}</p>{action}</div>;
}
