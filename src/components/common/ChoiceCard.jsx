import React from 'react';

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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
            <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}
