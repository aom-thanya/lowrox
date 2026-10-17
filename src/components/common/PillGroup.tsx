import React from 'react';
import PillButton from './PillButton';

export type PillOption = { value: string; label: React.ReactNode };

// Renders a row of PillButtons. `value` may be a single selection or a list (multi-select).
export default function PillGroup({
  options,
  value,
  onSelect,
  className = '',
  pillClassName = ''
}: { options: PillOption[]; value: string | string[]; onSelect: (value: string) => void; className?: string; pillClassName?: string }) {
  const isSelected = (optionValue: string) => Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
  return (
    <div className={`onboarding-pill-container ${className}`}>
      {options.map(opt => (
        <PillButton
          key={opt.value}
          label={opt.label}
          isSelected={isSelected(opt.value)}
          onClick={() => onSelect(opt.value)}
          className={pillClassName}
        />
      ))}
    </div>
  );
}
