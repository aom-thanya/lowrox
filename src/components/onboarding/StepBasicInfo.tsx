import type { StepHandle, StepProps } from '../../types/models';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import ChoiceCard from '../common/ChoiceCard';
import FormSection from '../common/FormSection';
import OnboardingStepLayout from './OnboardingStepLayout';
import { useStepSubmit } from '../../hooks/useStepSubmit';
import step1Img from '../../assets/onboarding/step1.jpg';
import { calculateAge } from '../../utils/onboardingUtils';
import { Venus, Mars, CircleUser } from 'lucide-react';

const GENDER_OPTIONS = [
  { value: 'female', label: 'หญิง', icon: <Venus size={24} /> },
  { value: 'male', label: 'ชาย', icon: <Mars size={24} /> },
  { value: 'unspecified', label: 'ไม่ระบุ', icon: <CircleUser size={24} /> }
];

const StepBasicInfo = forwardRef<StepHandle, StepProps>(({ onNext, isEditor, externalShowValidation }, ref) => {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [birthDate, setBirthDate] = useState(formData.demographics.birthDate || '');
  const { isSubmitting, submitError, setSubmitError, submit } = useStepSubmit('บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง');
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
    const newErrors: Record<string, string> = {};

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

    if (validate()) await submit(onNext);
  };



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

  return (
    <OnboardingStepLayout
      isEditor={isEditor}
      variant="split"
      illustration={step1Img}
      illustrationAlt="Lowrox runner illustration"
      title="มาทำความรู้จักกันหน่อย 👋"
      description="ข้อมูลนี้จะช่วยให้ Lowrox ปรับแต่งประสบการณ์และเป้าหมายให้เหมาะกับคุณที่สุด"
      onNext={handleNext}
      nextLabel={isSubmitting ? 'กำลังบันทึก...' : 'รู้จักกันแล้ว ไปต่อ →'}
      nextDisabled={!isFormValid || isSubmitting}
    >
      {formContent}
    </OnboardingStepLayout>
  );
});

export default StepBasicInfo;
