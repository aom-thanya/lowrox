import React from 'react';
export default function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`form-control ${className}`} {...props} />;
}
