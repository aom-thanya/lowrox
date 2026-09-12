import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import ChoiceCard from '../common/ChoiceCard';
import FormSection from '../common/FormSection';
import step1Img from '../../assets/onboarding/step1.png';
import { calculateAge } from '../../utils/onboardingUtils';
import { Venus, Mars, CircleUser } from 'lucide-react';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  aboutYou: step1Img,
};

const GENDER_OPTIONS = [
  { value: 'female', label: 'หญิง', icon: <Venus size={24} /> },
  { value: 'male', label: 'ชาย', icon: <Mars size={24} /> },
  { value: 'unspecified', label: 'ไม่ระบุ', icon: <CircleUser size={24} /> }
];

const StepBasicInfo = forwardRef(({ onNext, isEditor, externalShowValidation }, ref) => {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [birthDate, setBirthDate] = useState(formData.demographics.birthDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const displayValidation = showValidation || externalShowValidation;

  useImperativeHandle(ref, () => ({
    validate
  }));

  // Note: We use birthDate for frontend calculation, but send age to backend
  // In the future, the backend schema should support birth_date directly 
  // to calculate age dynamically and avoid stale age data.

  useEffect(() => {
    if (birthDate !== formData.demographics.birthDate) {
      const age = calculateAge(birthDate);
      updateFormData('demographics', { ...formData.demographics, age, birthDate });
    }
  }, [birthDate]);



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

  const formContent = (
    <>
          {submitError && (
            <div className="onboarding-error-area" role="alert">
              {submitError}
            </div>
          )}

          <FormSection
            label="คุณเกิดวันไหน?"
            htmlFor="birthDate"
            error={displayValidation && errors.birthDate}
            helperText={
              birthDate && !isNaN(new Date(birthDate).getTime()) && new Date(birthDate) <= new Date()
                ? `ตอนนี้คุณอายุ ${calculateAge(birthDate)} ปี`
                : 'เราจะคำนวณอายุให้โดยอัตโนมัติ'
            }
          >
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                if (displayValidation) validate();
              }}
              className={displayValidation && errors.birthDate ? 'input-error' : ''}
              max={new Date().toISOString().split("T")[0]}
            />
          </FormSection>

          <FormSection
            label="อยากให้เราใช้ข้อมูลใดในการเทียบผลของคุณ?"
            helperText="เลือกข้อมูลที่คุณสะดวกให้เราใช้"
            error={displayValidation && errors.gender}
          >
            <div className="choice-cards-container">
              {GENDER_OPTIONS.map(opt => {
                const isSelected = formData.demographics.gender === opt.value;
                return (
                  <ChoiceCard
                    key={opt.value}
                    isSelected={isSelected}
                    onClick={() => {
                      updateFormData('demographics', { ...formData.demographics, gender: opt.value });
                      if (displayValidation) validate();
                    }}
                    icon={opt.icon}
                    label={opt.label}
                  />
                );
              })}
            </div>
          </FormSection>
    </>
  );

  if (isEditor) {
    return <div className="onboarding-editor-section">{formContent}</div>;
  }

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
          {formContent}
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
});

export default StepBasicInfo;
