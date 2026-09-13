import React, { useState } from 'react';

export default function Image({ 
  src, 
  alt = '', 
  className = '', 
  loading = 'lazy', 
  fallback = null,
  ...props 
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    if (fallback) return fallback;
    return null; // Equivalent to e.target.style.display = 'none'
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
