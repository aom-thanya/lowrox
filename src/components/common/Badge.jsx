import React from 'react';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    neutral: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-brand-100 text-brand-800',
    error: 'bg-error text-white',
    success: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.neutral} ${className}`}>
      {children}
    </span>
  );
}
