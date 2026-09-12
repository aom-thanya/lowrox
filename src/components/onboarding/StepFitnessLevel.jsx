import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import step2Img from '../../assets/onboarding/step2.png';
import ChoiceCard from '../common/ChoiceCard';
import FormSection from '../common/FormSection';
import InputWrapper from '../common/InputWrapper';
import FeedbackCard from '../common/FeedbackCard';
import { calculatePaceAndSpeed } from '../../utils/onboardingUtils';
import { Activity } from 'lucide-react';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  currentPace: step2Img,
};

const DISTANCE_OPTIONS = [
  { value: '1', label: '1 กม.' },
  { value: '3', label: '3 กม.' },
  { value: '5', label: '5 กม.' },
  { value: '10', label: '10 กม.' },
  { value: 'custom', label: 'ระบุเอง' },
  { value: 'not_tracked', label: 'ยังไม่เคยจับเวลา' }
];

const DURATION_OPTIONS = [
  { value: 'under_30', label: 'ต่ำกว่า 30 นาที' },
  { value: '30_45', label: '30–45 นาที' },
  { value: '46_60', label: '46–60 นาที' },
  { value: 'over_60', label: 'มากกว่า 60 นาที' },
  { value: 'custom', label: 'ระบุเวลาเอง' },
  { value: 'unknown', label: 'จำไม่ได้' }
];

export default function StepFitnessLevel({ onNext, onPrev }) {
  const { formData, updateFormData } = useOnboarding();

  // Initialize local state from context
  const [distSelect, setDistSelect] = useState(formData.fitnessLevel.distanceSelection || '');
  const [customDist, setCustomDist] = useState(formData.fitnessLevel.customDistance || '');

  const [durSelect, setDurSelect] = useState(formData.fitnessLevel.durationSelection || '');
  const [customHrs, setCustomHrs] = useState(formData.fitnessLevel.customDurationHours || '');
  const [customMins, setCustomMins] = useState(formData.fitnessLevel.customDurationMinutes || '');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Sync state back to context whenever it changes
  useEffect(() => {
    let finalDist = '';
    let finalDur = '';

    if (distSelect && distSelect !== 'custom' && distSelect !== 'not_tracked') {
      finalDist = distSelect;
    } else if (distSelect === 'custom') {
      finalDist = customDist;
    }

    if (durSelect === 'custom') {
      const h = Number(customHrs) || 0;
      const m = Number(customMins) || 0;
      finalDur = (h * 60 + m).toString();
    }

    updateFormData('fitnessLevel', {
      ...formData.fitnessLevel,
      distanceSelection: distSelect,
      customDistance: customDist,
      durationSelection: durSelect,
      customDurationHours: customHrs,
      customDurationMinutes: customMins,
      runningDistance: finalDist,
      runningDuration: finalDur,
    });
  }, [distSelect, customDist, durSelect, customHrs, customMins]);

  const validate = () => {
    const newErrors = {};

    if (!distSelect) {
      newErrors.distance = 'กรุณาเลือกระยะทางที่ใกล้เคียงที่สุด';
    } else if (distSelect === 'custom') {
      const d = Number(customDist);
      if (!customDist.trim()) {
        newErrors.distance = 'กรุณาระบุระยะทาง';
      } else if (isNaN(d) || d <= 0) {
        newErrors.distance = 'ระยะทางต้องมากกว่า 0 กม.';
      } else if (d > 999.99) {
        newErrors.distance = 'กรุณาตรวจสอบระยะทางอีกครั้ง';
      }
    }

    if (distSelect !== 'not_tracked') {
      if (!durSelect) {
        newErrors.duration = 'กรุณาเลือกเวลาที่ใกล้เคียงที่สุด';
      } else if (durSelect === 'custom') {
        const h = Number(customHrs) || 0;
        const m = Number(customMins) || 0;
        if (customHrs === '' && customMins === '') {
          newErrors.duration = 'กรุณาระบุเวลาที่ใช้';
        } else if (h === 0 && m === 0) {
          newErrors.duration = 'กรุณาระบุเวลาที่ใช้';
        } else if (m < 0 || m > 59) {
          newErrors.duration = 'กรุณาระบุนาทีระหว่าง 0–59';
        } else if (h < 0) {
          newErrors.duration = 'กรุณาระบุชั่วโมงที่ถูกต้อง';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getExactDistance = () => {
    if (distSelect === 'custom') return Number(customDist);
    if (distSelect && distSelect !== 'not_tracked') return Number(distSelect);
    return 0;
  };

  const getExactDurationMin = () => {
    if (durSelect === 'custom') {
      return (Number(customHrs) || 0) * 60 + (Number(customMins) || 0);
    }
    return 0;
  };

  const isFormValid = () => {
    if (!distSelect) return false;
    if (distSelect === 'not_tracked') return true;

    if (distSelect === 'custom') {
      const d = Number(customDist);
      if (isNaN(d) || d <= 0 || d > 999.99) return false;
    }

    if (!durSelect) return false;
    if (durSelect === 'unknown') return true;
    if (durSelect !== 'custom') return true;

    const h = Number(customHrs) || 0;
    const m = Number(customMins) || 0;
    if (h === 0 && m === 0) return false;
    if (m < 0 || m > 59 || h < 0) return false;

    return true;
  };

  const handleNext = async () => {
    setShowValidation(true);
    setSubmitError('');

    if (validate()) {
      setIsSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onNext();
      } catch (error) {
        setSubmitError('บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const exactDist = getExactDistance();
  const exactDur = getExactDurationMin();
  const { paceStr, speedStr } = calculatePaceAndSpeed(exactDist, exactDur);

  const getCtaLabel = () => {
    if (isSubmitting) return 'กำลังบันทึก...';
    if (distSelect === 'not_tracked' || durSelect === 'unknown') return 'ไปต่อ →';
    return 'บันทึกจุดเริ่มต้น →';
  };

  return (
    <>
      <div className="onboarding-modal-body onboarding-step-layout">
        <div className="onboarding-illustration-column flex flex-col items-center text-center">
          <div className="onboarding-illustration-container">
            <img
              src={ONBOARDING_STEP_ILLUSTRATIONS.currentPace}
              alt="Lowrox current pace illustration"
              className="onboarding-illustration"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="onboarding-form-section mt-24">
            <h2 className="display-sm mb-8"><Activity size={28} className="inline-block align-text-bottom mr-8" />สถิติปัจจุบันของคุณ</h2>
            <p className="body-md text-neutral-600">
              ไม่ต้องเป็นสถิติที่ดีที่สุด เลือกครั้งที่ใกล้เคียงกับคุณที่สุดได้เลย
            </p>
          </div>

          {submitError && (
            <div className="onboarding-error-area" role="alert">
              {submitError}
            </div>
          )}

          {/* Question 1: Distance */}
          <FormSection
            label="ครั้งล่าสุด คุณวิ่งได้ประมาณเท่าไร?"
            error={showValidation && errors.distance}
          >
            <div className="choice-cards-container flex-wrap mt-12">
              {DISTANCE_OPTIONS.map(opt => {
                const isSelected = distSelect === opt.value;
                return (
                  <ChoiceCard
                    key={opt.value}
                    isSelected={isSelected}
                    onClick={() => {
                      setDistSelect(opt.value);
                      if (opt.value === 'not_tracked') setDurSelect('');
                      if (showValidation) validate();
                    }}
                    label={opt.label}
                    className="flex-1 min-w-[120px] p-[16px_32px]"
                  />
                );
              })}
            </div>
          </FormSection>

          {distSelect === 'custom' && (
            <FormSection
              label="ระยะทางโดยประมาณ"
              htmlFor="customDist"
              className="mt-[-16px]"
            >
              <InputWrapper suffix="กม." className="max-w-[200px] mt-8">
                <input
                  type="number"
                  id="customDist"
                  value={customCustomDistHandler()}
                  onChange={(e) => {
                    setCustomDist(e.target.value);
                    if (showValidation) validate();
                  }}
                  placeholder="เช่น 6.5"
                  step="0.01"
                  min="0.01"
                  max="999.99"
                  className={`w-full pr-48 appearance-none ${showValidation && errors.distance ? 'input-error' : ''}`}
                />
              </InputWrapper>
            </FormSection>
          )}

          {/* Question 2: Duration */}
          {distSelect && distSelect !== 'not_tracked' && (
            <FormSection
              label="ใช้เวลาวิ่งไปเท่าไร? (โดยประมาณ)"
              helperText="ข้อมูลนี้ช่วยให้เรารู้ Pace คร่าวๆ ของคุณ"
              error={showValidation && errors.duration}
              className="onboarding-fade-in"
            >
              <div className="choice-cards-container flex-wrap mt-12">
                {DURATION_OPTIONS.map(opt => {
                  const isSelected = durSelect === opt.value;
                  return (
                    <ChoiceCard
                      key={opt.value}
                      isSelected={isSelected}
                      onClick={() => {
                        setDurSelect(opt.value);
                        if (showValidation) validate();
                      }}
                      label={opt.label}
                      className="flex-[1_0_45%] min-w-[140px] p-[16px_32px]"
                    />
                  );
                })}
              </div>
            </FormSection>
          )}

          {durSelect === 'custom' && (
            <div className="onboarding-form-section mt-[-16px]">
              <div className="flex gap-16 items-center">
                <InputWrapper suffix="ชั่วโมง" className="w-[140px]">
                  <input
                    type="number"
                    value={customHrs}
                    onChange={(e) => {
                      setCustomHrs(e.target.value);
                      if (showValidation) validate();
                    }}
                    placeholder="00"
                    min="0"
                    className={`w-full pr-64 appearance-none text-center ${showValidation && errors.duration ? 'input-error' : ''}`}
                  />
                </InputWrapper>
                <InputWrapper suffix="นาที" className="w-[140px]">
                  <input
                    type="number"
                    value={customMins}
                    onChange={(e) => {
                      setCustomMins(e.target.value);
                      if (showValidation) validate();
                    }}
                    placeholder="00"
                    min="0"
                    max="59"
                    className={`w-full pr-48 appearance-none text-center ${showValidation && errors.duration ? 'input-error' : ''}`}
                  />
                </InputWrapper>
              </div>
            </div>
          )}

          {/* Feedback section */}
          {distSelect === 'not_tracked' && (
            <FeedbackCard title="ไม่เป็นไร ทุกคนมีจุดเริ่มต้นของตัวเอง 🙌">
              <p className="text-sm text-neutral-700">คุณสามารถทำ Quick Assessment เพื่อค้นหา Level ได้ภายหลัง</p>
            </FeedbackCard>
          )}

          {distSelect && distSelect !== 'not_tracked' && durSelect === 'unknown' && (
            <FeedbackCard>
              <p className="text-sm text-neutral-700">เราบันทึกระยะทางไว้ให้แล้ว คุณสามารถเพิ่มเวลาเพื่อประเมิน Level ภายหลังได้</p>
            </FeedbackCard>
          )}

          {exactDist > 0 && exactDur > 0 && paceStr && (
            <FeedbackCard>
              <h4 className="text-sm font-semibold text-neutral-600 mb-8 uppercase">จุดเริ่มต้นของคุณ</h4>
              <div className="flex gap-24 items-baseline mb-12">
                <div>
                  <div className="text-[28px] font-bold text-brand-600 leading-none">
                    {exactDist} <span className="text-[16px] font-semibold">กม.</span>
                  </div>
                </div>
                <div>
                  <div className="text-[28px] font-bold text-brand-600 leading-none">
                    {exactDur} <span className="text-[16px] font-semibold">นาที</span>
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-semibold mb-8">
                Pace โดยประมาณ {paceStr} นาที/กม. (ความเร็ว {speedStr} กม./ชม.)
              </div>
              <p className="text-sm text-neutral-700">ดีเลย เราเริ่มเห็นจังหวะของคุณแล้ว</p>
            </FeedbackCard>
          )}
        </div>
      </div>

      <div className="onboarding-modal-footer">
        <button
          className="btn btn-secondary btn-md w-auto mr-16"
          onClick={onPrev}
        >
          ← ย้อนกลับ
        </button>
        <button
          className="btn btn-primary btn-md btn-cta w-full"
          onClick={handleNext}
          disabled={!isFormValid() || isSubmitting}
        >
          {getCtaLabel()}
        </button>
      </div>
    </>
  );

  // Helper for rendering custom distance safely
  function customCustomDistHandler() {
    return customDist;
  }
}
