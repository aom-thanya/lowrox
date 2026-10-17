import React, { useEffect, useRef, useState } from 'react';
import Image from '../common/Image';
import { OnboardingProvider, useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import type { OnboardingData } from '../../types/models';
import { QuickGoalStep, QuickRunStep, QuickSafetyStep } from './QuickSteps';
import logoImg from '../../assets/logo-64.png';
import ExitConfirmationModal from './ExitConfirmationModal';
import Modal from '../common/Modal';

function OnboardingContent({ onClose, onComplete, redirectDestination }: { onClose: () => void; onComplete?: () => void; redirectDestination: string }) {
  const { currentStep, formData } = useOnboarding();
  const { saveOnboardingData } = useAuth();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const stepRegion = useRef<HTMLDivElement | null>(null);

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

  // Save the answers to the account; the first level is computed from them.
  // `latest` carries the final step's answers, which aren't in formData until the next render.
  const handleSubmit = async (latest: Partial<OnboardingData> = {}) => {
    await saveOnboardingData({ ...formData, ...latest });
    onComplete?.();
  };

  const TOTAL_STEPS = 3;
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <>
      <Modal isOpen={true} onClose={handleCloseAttempt} hideCloseButton={true} overlayClassName="onboarding-modal-backdrop" className="onboarding-modal-content">
        <div className="onboarding-modal-header">
          <div className="onboarding-header-top">
            <Image src={logoImg} alt="LOWROX" className="onboarding-logo" loading="eager" />
            <div className="onboarding-step-text mr-8">{`${Math.min(currentStep, TOTAL_STEPS)} / ${TOTAL_STEPS}`}</div>
          </div>
          <div className="onboarding-progress-bar">
            <div className="onboarding-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <button className="modal-close-btn top-6 right-6" onClick={handleCloseAttempt} aria-label="Close onboarding">
            &times;
          </button>
        </div>

        <div className="onboarding-step-region" ref={stepRegion}>
        {/* Each step shares a scrollable body and a fixed footer. */}
        {currentStep === 1 && <QuickRunStep />}
        {currentStep === 2 && <QuickGoalStep />}
        {currentStep >= 3 && <QuickSafetyStep onFinish={handleSubmit} />}
        </div>
      </Modal>

      {showExitConfirm && (
        <ExitConfirmationModal onConfirm={confirmExit} onCancel={cancelExit} />
      )}
    </>
  );
}

export default function OnboardingModal({ isOpen, onClose, onComplete, redirectDestination = '/level' }: { isOpen: boolean; onClose: () => void; onComplete?: () => void; redirectDestination?: string }) {
  if (!isOpen) return null;

  return (
    <OnboardingProvider>
      <OnboardingContent onClose={onClose} onComplete={onComplete} redirectDestination={redirectDestination} />
    </OnboardingProvider>
  );
}
