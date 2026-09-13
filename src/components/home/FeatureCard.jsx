import React from 'react';
import ContentCard from '../common/ContentCard';

export default function FeatureCard({ icon: Icon, title, description, step }) {
  return (
    <ContentCard className="home-feature-card">
      <div className="home-feature-content">
        {step ? (
          <div className="home-feature-step">
            {step}
          </div>
        ) : Icon ? (
          <div className="home-feature-icon">
            <Icon size={32} />
          </div>
        ) : null}
        <div className="home-feature-copy">
          <h3 className="heading-4">{title}</h3>
          <p className="body-md text-neutral-600">{description}</p>
        </div>
      </div>
    </ContentCard>
  );
}
