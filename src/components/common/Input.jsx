import React from 'react';
export default function Input({ className = '', ...props }) {
  return <input type="text" className={`form-control ${className}`} {...props} />;
}
