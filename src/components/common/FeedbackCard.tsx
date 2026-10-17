import React from 'react';

export default function FeedbackCard({
  title,
  icon,
  children,
  className = ''
}: { title?: React.ReactNode; icon?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`onboarding-feedback-card onboarding-fade-in ${className}`}>
      {title && (
        <h4 className="font-bold mb-1 flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}
