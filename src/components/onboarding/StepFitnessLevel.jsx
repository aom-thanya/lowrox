import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  currentPace: "https://cdni.iconscout.com/illustration/premium/thumb/empty-state-placeholder-illustration-svg-download-png-13996746.png",
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
  let paceStr = '';
  let speedStr = '';
  
  if (exactDist > 0 && exactDur > 0) {
    const decimalPace = exactDur / exactDist;
    const pMins = Math.floor(decimalPace);
    const pSecs = Math.round((decimalPace - pMins) * 60);
    paceStr = `${pMins}:${pSecs.toString().padStart(2, '0')}`;
    
    const speed = exactDist / (exactDur / 60);
    speedStr = speed.toFixed(1);
  }

  const getCtaLabel = () => {
    if (isSubmitting) return 'กำลังบันทึก...';
    if (distSelect === 'not_tracked' || durSelect === 'unknown') return 'ไปต่อ →';
    return 'บันทึกจุดเริ่มต้น →';
  };

  return (
    <>
      <div className="onboarding-modal-body onboarding-step-layout">
        <div className="onboarding-illustration-column" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
          <div className="onboarding-form-section" style={{ marginTop: '24px' }}>
            <h2 className="display-sm" style={{ marginBottom: '8px' }}>สถิติปัจจุบันของคุณ 🏃‍♂️</h2>
            <p className="body-md" style={{ color: 'var(--color-neutral-600)' }}>
              ไม่ต้องเป็นสถิติที่ดีที่สุด เลือกครั้งที่ใกล้เคียงกับคุณที่สุดได้เลย
            </p>
          </div>

          {submitError && (
            <div className="onboarding-error-area" role="alert">
              {submitError}
            </div>
          )}

          {/* Question 1: Distance */}
          <div className="onboarding-form-section">
            <label className="onboarding-label">ครั้งล่าสุด คุณวิ่งได้ประมาณเท่าไร?</label>
            
            <div className="choice-cards-container" style={{ flexWrap: 'wrap', marginTop: '12px' }}>
              {DISTANCE_OPTIONS.map(opt => {
                const isSelected = distSelect === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`choice-card ${isSelected ? 'choice-card-selected' : ''}`}
                    style={{ flex: '1 0 30%', minWidth: '120px', padding: '16px 32px' }}
                    onClick={() => {
                      setDistSelect(opt.value);
                      if (opt.value === 'not_tracked') setDurSelect('');
                      if (showValidation) validate();
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="choice-card-label" style={{ fontSize: '14px' }}>{opt.label}</div>
                    {isSelected && (
                      <div className="choice-card-check">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
                          <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {showValidation && errors.distance && (
              <span className="validation-message onboarding-error-text" role="alert">{errors.distance}</span>
            )}
          </div>

          {distSelect === 'custom' && (
            <div className="onboarding-form-section" style={{ marginTop: '-16px' }}>
              <label className="onboarding-label" htmlFor="customDist">ระยะทางโดยประมาณ</label>
              <div style={{ position: 'relative', maxWidth: '200px', marginTop: '8px' }}>
                <input 
                  type="number" 
                  id="customDist" 
                  value={customCustomDistHandler()}
                  onChange={(e) => {
                    setCustomDist(e.target.value);
                    if (showValidation) validate();
                  }}
                  className={showValidation && errors.distance ? 'input-error' : ''}
                  placeholder="เช่น 6.5"
                  step="0.01"
                  min="0.01"
                  max="999.99"
                  style={{ width: '100%', paddingRight: '48px', appearance: 'none' }}
                />
                <span className="onboarding-input-suffix">กม.</span>
              </div>
            </div>
          )}

          {/* Question 2: Duration */}
          {distSelect && distSelect !== 'not_tracked' && (
            <div className="onboarding-form-section onboarding-fade-in">
              <label className="onboarding-label">ใช้เวลาวิ่งไปเท่าไร? (โดยประมาณ)</label>
              <span className="onboarding-helper-text">
                ข้อมูลนี้ช่วยให้เรารู้ Pace คร่าวๆ ของคุณ
              </span>
              
              <div className="choice-cards-container" style={{ flexWrap: 'wrap', marginTop: '12px' }}>
                {DURATION_OPTIONS.map(opt => {
                  const isSelected = durSelect === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`choice-card ${isSelected ? 'choice-card-selected' : ''}`}
                      style={{ flex: '1 0 45%', minWidth: '140px', padding: '16px 32px' }}
                      onClick={() => {
                        setDurSelect(opt.value);
                        if (showValidation) validate();
                      }}
                      aria-pressed={isSelected}
                    >
                      <div className="choice-card-label" style={{ fontSize: '14px' }}>{opt.label}</div>
                      {isSelected && (
                        <div className="choice-card-check">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
                            <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {showValidation && errors.duration && (
                <span className="validation-message onboarding-error-text" role="alert">{errors.duration}</span>
              )}
            </div>
          )}

          {durSelect === 'custom' && (
            <div className="onboarding-form-section" style={{ marginTop: '-16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="onboarding-input-wrapper" style={{ width: '140px' }}>
                  <input 
                    type="number" 
                    value={customHrs}
                    onChange={(e) => {
                      setCustomHrs(e.target.value);
                      if (showValidation) validate();
                    }}
                    className={showValidation && errors.duration ? 'input-error' : ''}
                    placeholder="00"
                    min="0"
                    style={{ width: '100%', paddingRight: '64px', appearance: 'none', textAlign: 'center' }}
                  />
                  <span className="onboarding-input-suffix">ชั่วโมง</span>
                </div>
                <div className="onboarding-input-wrapper" style={{ width: '140px' }}>
                  <input 
                    type="number" 
                    value={customMins}
                    onChange={(e) => {
                      setCustomMins(e.target.value);
                      if (showValidation) validate();
                    }}
                    className={showValidation && errors.duration ? 'input-error' : ''}
                    placeholder="00"
                    min="0"
                    max="59"
                    style={{ width: '100%', paddingRight: '48px', appearance: 'none', textAlign: 'center' }}
                  />
                  <span className="onboarding-input-suffix">นาที</span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback section */}
          {distSelect === 'not_tracked' && (
            <div className="onboarding-feedback-card onboarding-fade-in">
              <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>ไม่เป็นไร ทุกคนมีจุดเริ่มต้นของตัวเอง 🙌</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-neutral-700)' }}>คุณสามารถทำ Quick Assessment เพื่อค้นหา Level ได้ภายหลัง</p>
            </div>
          )}

          {distSelect && distSelect !== 'not_tracked' && durSelect === 'unknown' && (
            <div className="onboarding-feedback-card onboarding-fade-in">
              <p style={{ fontSize: '14px', color: 'var(--color-neutral-700)' }}>เราบันทึกระยะทางไว้ให้แล้ว คุณสามารถเพิ่มเวลาเพื่อประเมิน Level ภายหลังได้</p>
            </div>
          )}

          {exactDist > 0 && exactDur > 0 && paceStr && (
            <div className="onboarding-feedback-card onboarding-fade-in">
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-neutral-600)', marginBottom: '8px', textTransform: 'uppercase' }}>จุดเริ่มต้นของคุณ</h4>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'baseline', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-brand-600)', lineHeight: '1' }}>
                    {exactDist} <span style={{ fontSize: '16px', fontWeight: '600' }}>กม.</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-brand-600)', lineHeight: '1' }}>
                    {exactDur} <span style={{ fontSize: '16px', fontWeight: '600' }}>นาที</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Pace โดยประมาณ {paceStr} นาที/กม. (ความเร็ว {speedStr} กม./ชม.)
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-neutral-700)' }}>ดีเลย เราเริ่มเห็นจังหวะของคุณแล้ว</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="onboarding-modal-footer">
        <button 
          className="btn btn-secondary btn-md" 
          onClick={onPrev}
          style={{ width: 'auto', marginRight: '16px' }}
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
