import React from 'react';

export default function ModalHeader({ title, children, onClose, className = '' }: { title?: React.ReactNode; children?: React.ReactNode; onClose?: () => void; className?: string }) {
  return (
    <div className={`p-4 md:p-6 border-b border-neutral-200 flex items-center justify-between shrink-0 ${className}`}>
      {children || <h3 className="text-lg font-bold text-neutral-800 m-0">{title}</h3>}
      {onClose && !children && (
        <button 
          className="w-8 h-8 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors z-10 text-xl font-medium leading-none ml-4 shrink-0"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
      )}
    </div>
  );
}
