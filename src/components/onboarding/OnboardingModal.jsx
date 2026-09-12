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
import Modal from '../common/Modal';

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
    <>
      <Modal isOpen={true} onClose={handleCloseAttempt} hideCloseButton={true} className="onboarding-modal-content max-w-[500px] h-[90vh] md:h-[80vh] min-h-[500px] p-0 flex flex-col">
        <div className="onboarding-modal-header">
          <div className="onboarding-header-top">
            <img src={logoImg} alt="LOWROX" className="onboarding-logo" />
            <div className="onboarding-step-text mr-32">{currentStep} / 5</div>
          </div>
          <div className="onboarding-progress-bar">
            <div className="onboarding-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <button className="modal-close-btn top-[24px] right-[24px]" onClick={handleCloseAttempt} aria-label="Close onboarding">
            &times;
          </button>
        </div>

        {/* Steps should render their own body and footer to support sticky footers */}
        {currentStep === 1 && <StepBasicInfo onNext={nextStep} />}
        {currentStep === 2 && <StepFitnessLevel onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 3 && <StepGoals onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 4 && <StepAvailability onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 5 && <StepHealth onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 6 && <StepReview onPrev={prevStep} onSubmit={handleSubmit} />}
      </Modal>

      {showExitConfirm && (
        <ExitConfirmationModal onConfirm={confirmExit} onCancel={cancelExit} />
      )}
    </>
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
