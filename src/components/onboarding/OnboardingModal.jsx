import React, { useState } from 'react';
import { OnboardingProvider, useOnboarding } from '../../context/OnboardingContext';
import StepBasicInfo from './StepBasicInfo';
import StepFitnessLevel from './StepFitnessLevel';
import StepGoals from './StepGoals';
import StepAvailability from './StepAvailability';
import StepHealth from './StepHealth';
import StepReview from './StepReview';
import logoImg from '../../assets/logo.png';
import ExitConfirmationModal from './ExitConfirmationModal';

function OnboardingContent({ onClose, onComplete }) {
  const { currentStep, nextStep, prevStep, submitForm } = useOnboarding();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleCloseAttempt = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleSubmit = async () => {
    await submitForm();
    onComplete();
  };

  const stepIndicators = [
    'มาเตรียมตัวไปด้วยกัน', // This is technically 0, won't be used since step starts at 1
    'ก้าวที่ 1 จาก 5',
    'ก้าวที่ 2 จาก 5',
    'ก้าวที่ 3 จาก 5',
    'ก้าวที่ 4 จาก 5',
    'ก้าวสุดท้าย',
    'พร้อมออกตัว'
  ];

  const progressPercentage = ((currentStep - 1) / 5) * 100;

  return (
    <div className="onboarding-modal-backdrop" aria-modal="true" role="dialog" aria-labelledby="onboarding-title" aria-describedby="onboarding-desc">
      <div className="onboarding-modal-content">
        <div className="onboarding-modal-header">
          <img src={logoImg} alt="LOWROX" className="onboarding-logo" />
          <h1 id="onboarding-title" className="display-md" style={{ marginBottom: '8px' }}>มารู้จักคุณให้มากขึ้น</h1>
          <p id="onboarding-desc" className="body-sm" style={{ color: 'var(--color-neutral-600)' }}>
            กรอกข้อมูลเพื่อให้ Lowrox เข้าใจระดับ เป้าหมาย และรูปแบบการออกกำลังกายที่เหมาะกับคุณ
          </p>
          <div className="onboarding-progress-container">
            <div className="onboarding-step-indicator" style={{ marginTop: '16px' }}>
              {stepIndicators[currentStep]}
            </div>
            <div className="onboarding-progress-bar">
              <div className="onboarding-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleCloseAttempt} aria-label="Close onboarding">
            &times;
          </button>
        </div>

        <div className="onboarding-modal-body">
          {currentStep === 1 && <StepBasicInfo onNext={nextStep} />}
          {currentStep === 2 && <StepFitnessLevel onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 3 && <StepGoals onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 4 && <StepAvailability onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 5 && <StepHealth onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 6 && <StepReview onPrev={prevStep} onSubmit={handleSubmit} />}
        </div>
      </div>

      {showExitConfirm && (
        <ExitConfirmationModal onConfirm={confirmExit} onCancel={cancelExit} />
      )}
    </div>
  );
}

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  if (!isOpen) return null;

  return (
    <OnboardingProvider onComplete={onComplete}>
      <OnboardingContent onClose={onClose} onComplete={onComplete} />
    </OnboardingProvider>
  );
}
