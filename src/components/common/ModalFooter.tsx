import React from 'react';

export default function ModalFooter({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 md:p-6 border-t border-neutral-200 flex items-center justify-between shrink-0 ${className}`}>
      {children}
    </div>
  );
}
