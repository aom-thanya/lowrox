import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import step1Img from '../../assets/onboarding/step1.png';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  aboutYou: step1Img,
};

const GENDER_OPTIONS = [
  { value: 'female', label: 'หญิง', icon: '♀' },
  { value: 'male', label: 'ชาย', icon: '♂' },
  { value: 'unspecified', label: 'ไม่ระบุ', icon: '⊝' }
];

export default function StepBasicInfo({ onNext }) {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [birthDate, setBirthDate] = useState(formData.demographics.birthDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Note: We use birthDate for frontend calculation, but send age to backend
  // In the future, the backend schema should support birth_date directly 
  // to calculate age dynamically and avoid stale age data.

  useEffect(() => {
    if (birthDate !== formData.demographics.birthDate) {
      const age = calculateAge(birthDate);
      updateFormData('demographics', { ...formData.demographics, age, birthDate });
    }
  }, [birthDate]);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDateObj = new Date(dob);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const validate = () => {
    const newErrors = {};

    if (!birthDate) {
      newErrors.birthDate = 'กรุณาระบุวันเกิดของคุณ';
    } else {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      if (birthDateObj > today) {
        newErrors.birthDate = 'วันเกิดต้องไม่เป็นวันที่ในอนาคต';
      } else if (isNaN(birthDateObj.getTime())) {
        newErrors.birthDate = 'รูปแบบวันที่ไม่ถูกต้อง';
      }
    }

    if (!formData.demographics.gender) {
      newErrors.gender = 'กรุณาเลือกข้อมูลที่ต้องการใช้เปรียบเทียบผล';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = birthDate && formData.demographics.gender;

  const handleNext = async () => {
    setShowValidation(true);
    setSubmitError('');

    if (validate()) {
      setIsSubmitting(true);

      try {
        // Mocking API call for save
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulating success
        onNext();
      } catch (error) {
        setSubmitError('บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="onboarding-modal-body onboarding-step-layout">
        <div className="onboarding-illustration-column flex flex-col items-center text-center">
          <div className="onboarding-illustration-container">
            <img
              src={ONBOARDING_STEP_ILLUSTRATIONS.aboutYou}
              alt="Lowrox runner illustration"
              className="onboarding-illustration"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="onboarding-form-section mt-24">
            <h2 className="display-sm mb-8">มาทำความรู้จักกันหน่อย 👋</h2>
            <p className="body-md text-neutral-600">
              ข้อมูลนี้จะช่วยให้ Lowrox ปรับแต่งประสบการณ์และเป้าหมายให้เหมาะกับคุณที่สุด
            </p>
          </div>
        </div>

        <div className="onboarding-form-column">

          {submitError && (
            <div className="onboarding-error-area" role="alert">
              {submitError}
            </div>
          )}

          <div className="onboarding-form-section">
            <label className="onboarding-label" htmlFor="birthDate">คุณเกิดวันไหน?</label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                if (showValidation) validate();
              }}
              className={showValidation && errors.birthDate ? 'input-error' : ''}
              max={new Date().toISOString().split("T")[0]}
            />
            {showValidation && errors.birthDate ? (
              <span className="validation-message" role="alert">{errors.birthDate}</span>
            ) : (
              <span className="onboarding-helper-text">
                {birthDate && !isNaN(new Date(birthDate).getTime()) && new Date(birthDate) <= new Date()
                  ? `ตอนนี้คุณอายุ ${calculateAge(birthDate)} ปี`
                  : 'เราจะคำนวณอายุให้โดยอัตโนมัติ'}
              </span>
            )}
          </div>

          <div className="onboarding-form-section">
            <label className="onboarding-label">อยากให้เราใช้ข้อมูลใดในการเทียบผลของคุณ?</label>
            <span className="onboarding-helper-text">
              เลือกข้อมูลที่คุณสะดวกให้เราใช้
            </span>

            <div className="choice-cards-container">
              {GENDER_OPTIONS.map(opt => {
                const isSelected = formData.demographics.gender === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`choice-card ${isSelected ? 'choice-card-selected' : ''}`}
                    onClick={() => {
                      updateFormData('demographics', { ...formData.demographics, gender: opt.value });
                      if (showValidation) validate();
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="choice-card-icon">{opt.icon}</div>
                    <div className="choice-card-label">{opt.label}</div>
                    {isSelected && (
                      <div className="choice-card-check">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
                          <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {showValidation && errors.gender && (
              <span className="validation-message onboarding-error-text" role="alert">{errors.gender}</span>
            )}
          </div>
        </div>
      </div>

      <div className="onboarding-modal-footer">
        <button
          className="btn btn-primary btn-md btn-cta w-full"
          onClick={handleNext}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'รู้จักกันแล้ว ไปต่อ →'}
        </button>
      </div>
    </>
  );
}
