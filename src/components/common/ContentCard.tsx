import React from 'react';

export default function ContentCard({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <div className={`content-card ${className}`}>{children}</div>;
}
