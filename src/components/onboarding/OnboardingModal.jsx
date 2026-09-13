import React, { useEffect, useRef, useState } from 'react';
import Image from '../common/Image';
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

function OnboardingContent({ onClose, onComplete, redirectDestination }) {
  const { currentStep, nextStep, prevStep, submitForm } = useOnboarding();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const stepRegion = useRef(null);

  useEffect(() => {
    const body = stepRegion.current?.querySelector('.onboarding-modal-body');
    if (body) body.scrollTop = 0;
  }, [currentStep]);

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
      <Modal isOpen={true} onClose={handleCloseAttempt} hideCloseButton={true} overlayClassName="onboarding-modal-backdrop" className="onboarding-modal-content">
        <div className="onboarding-modal-header">
          <div className="onboarding-header-top">
            <Image src={logoImg} alt="LOWROX" className="onboarding-logo" loading="eager" />
            <div className="onboarding-step-text mr-32">{currentStep <= 5 ? `${currentStep} / 5` : 'ตรวจสอบข้อมูล'}</div>
          </div>
          <div className="onboarding-progress-bar">
            <div className="onboarding-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <button className="modal-close-btn top-[24px] right-[24px]" onClick={handleCloseAttempt} aria-label="Close onboarding">
            &times;
          </button>
        </div>

        <div className="onboarding-step-region" ref={stepRegion}>
        {/* Each step shares a scrollable body and a fixed footer. */}
        {currentStep === 1 && <StepBasicInfo onNext={nextStep} />}
        {currentStep === 2 && <StepFitnessLevel onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 3 && <StepGoals onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 4 && <StepAvailability onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 5 && <StepHealth onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 6 && <StepReview onPrev={prevStep} onSubmit={handleSubmit} redirectDestination={redirectDestination} />}
        </div>
      </Modal>

      {showExitConfirm && (
        <ExitConfirmationModal onConfirm={confirmExit} onCancel={cancelExit} />
      )}
    </>
  );
}

export default function OnboardingModal({ isOpen, onClose, onComplete, redirectDestination = '/profile' }) {
  if (!isOpen) return null;

  return (
    <OnboardingProvider onComplete={onComplete}>
      <OnboardingContent onClose={onClose} onComplete={onComplete} redirectDestination={redirectDestination} />
    </OnboardingProvider>
  );
}
