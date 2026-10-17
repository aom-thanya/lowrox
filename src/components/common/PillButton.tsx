import React from 'react';
import { Check } from 'lucide-react';

export default function PillButton({
  isSelected,
  onClick,
  label,
  className = '',
  hasCheck = false
}: { isSelected?: boolean; onClick?: React.MouseEventHandler<HTMLButtonElement>; label: React.ReactNode; className?: string; hasCheck?: boolean }) {
  return (
    <button
      type="button"
      className={`onboarding-pill-button ${isSelected ? 'selected' : ''} ${className}`}
      onClick={onClick}
    >
      {hasCheck && isSelected && (
        <div className="w-4.5 h-4.5 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0 mr-2">
          <Check size={12} strokeWidth={3} />
        </div>
      )}
      {label}
    </button>
  );
}
