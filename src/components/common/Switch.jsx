import React from 'react';

export default function Switch({ checked, onChange, disabled, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby }) {
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={`switch ${disabled ? 'switch-disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    >
      <div className="switch-track">
        <div className="switch-thumb" />
      </div>
    </button>
  );
}
