import React from 'react';
import Image from '../common/Image';

type OnboardingStepLayoutProps = {
  isEditor?: boolean;
  illustration: string;
  illustrationAlt: string;
  title: React.ReactNode;
  description: React.ReactNode;
  // 'header': illustration beside the title above the form. 'split': illustration column next to the form column.
  variant?: 'header' | 'split';
  onPrev?: () => void;
  onNext: () => void;
  nextLabel: React.ReactNode;
  nextDisabled?: boolean;
  children: React.ReactNode;
};

// Shared chrome for onboarding steps. In the profile editor only the form content is rendered.
export default function OnboardingStepLayout({
  isEditor,
  illustration,
  illustrationAlt,
  title,
  description,
  variant = 'header',
  onPrev,
  onNext,
  nextLabel,
  nextDisabled,
  children
}: OnboardingStepLayoutProps) {
  if (isEditor) {
    return <div className="onboarding-editor-section">{children}</div>;
  }

  return (
    <>
      {variant === 'split' ? (
        <div className="onboarding-modal-body onboarding-step-layout">
          <div className="onboarding-illustration-column flex flex-col items-center text-center">
            <div className="onboarding-illustration-container">
              <Image src={illustration} alt={illustrationAlt} className="onboarding-illustration" />
            </div>
            <div className="onboarding-form-section mt-24">
              <h2 className="display-sm mb-8">{title}</h2>
              <p className="body-md text-neutral-600">{description}</p>
            </div>
          </div>
          <div className="onboarding-form-column">{children}</div>
        </div>
      ) : (
        <div className="onboarding-modal-body">
          <div className="onboarding-fullwidth-header">
            <Image src={illustration} alt={illustrationAlt} />
            <div className="onboarding-text-align">
              <h2 className="heading-2 mb-8 flex items-center">{title}</h2>
              <p className="body-md text-neutral-600">{description}</p>
            </div>
          </div>
          {children}
        </div>
      )}

      <div className="onboarding-modal-footer">
        {onPrev && (
          <button className="btn btn-secondary btn-md" onClick={onPrev}>
            ← ย้อนกลับ
          </button>
        )}
        <button className="btn btn-primary btn-md btn-cta w-full" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </button>
      </div>
    </>
  );
}
