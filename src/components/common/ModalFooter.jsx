import React from 'react';

export default function ModalFooter({ children, className = '' }) {
  return (
    <div className={`p-16 md:p-24 border-t border-neutral-200 flex items-center justify-between shrink-0 ${className}`}>
      {children}
    </div>
  );
}
