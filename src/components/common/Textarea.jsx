import React from 'react';
export default function Textarea({ className = '', ...props }) {
  return <textarea className={`form-control ${className}`} {...props} />;
}
