import React from 'react';

export default function ModalHeader({ title, children, onClose, className = '' }) {
  return (
    <div className={`p-16 md:p-24 border-b border-neutral-200 flex items-center justify-between shrink-0 ${className}`}>
      {children || <h3 className="text-[18px] font-bold text-neutral-800 m-0">{title}</h3>}
      {onClose && !children && (
        <button 
          className="w-32 h-32 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors z-10 text-[20px] font-medium leading-none ml-16 shrink-0"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
      )}
    </div>
  );
}
