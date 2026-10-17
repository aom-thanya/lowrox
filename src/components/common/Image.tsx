import React, { useState } from 'react';

export default function Image({ 
  src, 
  alt = '', 
  className = '', 
  loading = 'lazy', 
  decoding = 'async',
  fallback = null,
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: React.ReactNode }) {
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
      decoding={decoding}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
