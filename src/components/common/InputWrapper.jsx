import React from 'react';

export default function InputWrapper({
  suffix,
  error,
  children,
  className = ''
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {suffix && (
        <span className="absolute right-16 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
          {suffix}
        </span>
      )}
    </div>
  );
}
