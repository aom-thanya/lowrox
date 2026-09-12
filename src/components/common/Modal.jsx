import React, { useEffect } from 'react';

export default function Modal({
  isOpen = true,
  onClose,
  children,
  className = '',
  overlayClassName = '',
  hideCloseButton = false,
  zIndex = 2000,
  centered = true
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    let originalOverflow;
    if (isOpen) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-backdrop ${overlayClassName}`}
      style={{ zIndex }}
      aria-modal="true" 
      role="dialog"
      onClick={handleBackdropClick}
    >
      <div 
        className={`modal-content flex flex-col relative max-h-[90vh] overflow-hidden ${!className.includes('bg-') && !className.includes('onboarding-') ? 'modal-base-content' : ''} ${className}`}
      >
        {!hideCloseButton && onClose && (
          <button 
            className="absolute top-16 right-16 w-32 h-32 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors z-10 text-[20px] font-medium leading-none"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
