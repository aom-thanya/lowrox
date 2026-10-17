import React from 'react';

export default function ModalBody({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 md:p-6 overflow-y-auto flex-1 ${className}`}>
      {children}
    </div>
  );
}
