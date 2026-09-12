import React from 'react';

export default function PillButton({
  isSelected,
  onClick,
  label,
  className = '',
  hasCheck = false
}) {
  return (
    <button
      type="button"
      className={`onboarding-pill-button ${isSelected ? 'selected' : ''} ${className}`}
      onClick={onClick}
    >
      {hasCheck && isSelected && (
        <div className="w-[18px] h-[18px] rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0 mr-8">
          <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {label}
    </button>
  );
}
