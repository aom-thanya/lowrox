import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ChoiceCard({
  isSelected,
  onClick,
  icon,
  label,
  description,
  className = '',
  hasCheckMark = true,
  children
}: { isSelected?: boolean; onClick?: React.MouseEventHandler<HTMLButtonElement>; icon?: React.ReactNode; label?: React.ReactNode; description?: React.ReactNode; className?: string; hasCheckMark?: boolean; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`choice-card ${isSelected ? 'choice-card-selected' : ''} ${hasCheckMark ? 'choice-card-has-check' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {icon && <div className="choice-card-icon">{icon}</div>}
      {label && <div className="choice-card-label">{label}</div>}
      {description && <div className="choice-card-description text-sm text-neutral-500 mt-4">{description}</div>}
      {children}
      {hasCheckMark && isSelected && (
        <div className="choice-card-check">
          <CheckCircle2 size={20} fill="currentColor" stroke="white" />
        </div>
      )}
    </button>
  );
}
