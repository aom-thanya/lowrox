import React from 'react';

export default function FormSection({
  label,
  htmlFor,
  helperText,
  error,
  children,
  className = ''
}) {
  return (
    <div className={`onboarding-form-section ${className}`}>
      {label && (
        <label className="onboarding-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {helperText && !error && (
        <span className="onboarding-helper-text mb-8">{helperText}</span>
      )}
      {children}
      {error && (
        <span className="validation-message onboarding-error-text mt-8" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
