import React from 'react';

export default function FeedbackCard({
  title,
  icon,
  children,
  className = ''
}) {
  return (
    <div className={`onboarding-feedback-card onboarding-fade-in ${className}`}>
      {title && (
        <h4 className="font-bold mb-4 flex items-center gap-8">
          {icon && <span className="text-[16px]">{icon}</span>}
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}
