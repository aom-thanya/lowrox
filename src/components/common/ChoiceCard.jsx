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
}) {
  return (
    <button
      type="button"
      className={`choice-card ${isSelected ? 'choice-card-selected' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {icon && <div className="choice-card-icon">{icon}</div>}
      {label && <div className="choice-card-label">{label}</div>}
      {description && <div className="choice-card-description text-sm text-neutral-500 mt-4">{description}</div>}
      {children}
      {hasCheckMark && isSelected && (
        <div className="choice-card-check">
          <CheckCircle2 size={24} fill="currentColor" stroke="white" />
        </div>
      )}
    </button>
  );
}
