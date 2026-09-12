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
        <label id={htmlFor ? `${htmlFor}-label` : undefined} className="onboarding-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {helperText && (
        <span id={htmlFor ? `${htmlFor}-help` : undefined} className="onboarding-helper-text mb-8">{helperText}</span>
      )}
      {children}
      {error && (
        <span id={htmlFor ? `${htmlFor}-error` : undefined} className="validation-message onboarding-error-text mt-8" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
