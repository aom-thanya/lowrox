import React from 'react';

export default function ContentCard({ children, className = '' }) {
  return <div className={`content-card ${className}`}>{children}</div>;
}
