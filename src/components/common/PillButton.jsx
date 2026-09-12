import React from 'react';
import { Check } from 'lucide-react';

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
          <Check size={12} strokeWidth={3} />
        </div>
      )}
      {label}
    </button>
  );
}
