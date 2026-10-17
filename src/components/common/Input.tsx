import React from 'react';
export default function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={`form-control ${className}`} {...props} />;
}
