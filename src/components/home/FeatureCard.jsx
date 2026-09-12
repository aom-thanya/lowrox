import React from 'react';
import ContentCard from '../common/ContentCard';

export default function FeatureCard({ icon: Icon, title, description, step }) {
  return (
    <ContentCard className="h-full flex flex-col p-6 text-left">
      <div className="flex items-start gap-4 mb-4">
        {step ? (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
            {step}
          </div>
        ) : Icon ? (
          <div className="flex-shrink-0 text-brand-500">
            <Icon size={32} />
          </div>
        ) : null}
        <div>
          <h3 className="heading-5 mb-2">{title}</h3>
          <p className="body-md text-neutral-600">{description}</p>
        </div>
      </div>
    </ContentCard>
  );
}
