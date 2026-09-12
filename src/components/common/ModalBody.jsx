import React from 'react';

export default function ModalBody({ children, className = '' }) {
  return (
    <div className={`p-16 md:p-24 overflow-y-auto flex-1 ${className}`}>
      {children}
    </div>
  );
}
