import React from 'react';

export default function Button({ children, variant = 'primary', loading = false, disabled, className = '', type = 'button', ...props }) {
  return <button type={type} className={`btn btn-${variant} btn-md ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{children}</button>;
}
