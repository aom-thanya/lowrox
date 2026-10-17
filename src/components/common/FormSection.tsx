import React from 'react';

export default function FormSection({
  label,
  htmlFor,
  helperText,
  error,
  children,
  className = ''
}: { label?: React.ReactNode; htmlFor?: string; helperText?: React.ReactNode; error?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`onboarding-form-section ${className}`}>
      {label && (
        <label id={htmlFor ? `${htmlFor}-label` : undefined} className="onboarding-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {helperText && (
        <span id={htmlFor ? `${htmlFor}-help` : undefined} className="onboarding-helper-text mb-2">{helperText}</span>
      )}
      {children}
      {error && (
        <span id={htmlFor ? `${htmlFor}-error` : undefined} className="validation-message onboarding-error-text mt-2" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
