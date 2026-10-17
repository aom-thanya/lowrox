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
}: { isOpen?: boolean; onClose?: () => void; children?: React.ReactNode; className?: string; overlayClassName?: string; hideCloseButton?: boolean; zIndex?: number; centered?: boolean }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    let originalOverflow: string;
    if (isOpen) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors z-10 text-xl font-medium leading-none"
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
