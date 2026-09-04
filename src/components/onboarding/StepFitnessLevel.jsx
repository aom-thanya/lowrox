import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

export default function StepFitnessLevel({ onNext, onPrev }) {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const distance = Number(formData.fitnessLevel.runningDistance);
    const duration = Number(formData.fitnessLevel.runningDuration);

    if (!formData.fitnessLevel.runningDistance) {
      newErrors.distance = 'บอกระยะทางที่วิ่งก่อนนะ';
    } else if (isNaN(distance) || distance <= 0) {
      newErrors.distance = 'ระยะทางต้องมากกว่า 0 กม. ลองกรอกใหม่อีกครั้ง';
    }

    if (!formData.fitnessLevel.runningDuration) {
      newErrors.duration = 'บอกเวลาที่ใช้ก่อน แล้วเราไปต่อกัน';
    } else if (isNaN(duration) || duration <= 0 || !Number.isInteger(duration)) {
      newErrors.duration = 'เวลาต้องมากกว่า 0 นาที ลองเช็กอีกครั้งนะ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="onboarding-section">
      <h2 className="display-sm" style={{ marginBottom: '8px' }}>ตอนนี้คุณอยู่ตรงไหนแล้ว?</h2>
      <p className="body-md" style={{ color: 'var(--color-neutral-600)', marginBottom: '24px' }}>
        ไม่ต้องเร็วที่สุด แค่บอกสถิติล่าสุดที่ใกล้เคียงกับตัวคุณ เราจะใช้เป็นจุดเริ่มต้นเพื่อไปต่อด้วยกัน
      </p>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label htmlFor="runningDistance">ระยะทางที่วิ่ง</label>
        <div style={{ position: 'relative' }}>
          <input 
            type="number" 
            id="runningDistance" 
            placeholder="เช่น 5.00" 
            value={formData.fitnessLevel.runningDistance}
            onChange={(e) => updateFormData('fitnessLevel', { ...formData.fitnessLevel, runningDistance: e.target.value })}
            className={errors.distance ? 'input-error' : ''}
            min="0.01"
            step="0.01"
            style={{ paddingRight: '48px' }}
          />
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-500)' }}>กม.</span>
        </div>
        {errors.distance ? (
          <span className="validation-message" role="alert">{errors.distance}</span>
        ) : (
          <span className="helper-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: '4px', display: 'block' }}>
            ใช้สถิติจากการวิ่งครั้งล่าสุดหรือครั้งที่ใกล้เคียงที่สุด
          </span>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '32px' }}>
        <label htmlFor="runningDuration">เวลาที่ใช้</label>
        <div style={{ position: 'relative' }}>
          <input 
            type="number" 
            id="runningDuration" 
            placeholder="เช่น 40" 
            value={formData.fitnessLevel.runningDuration}
            onChange={(e) => updateFormData('fitnessLevel', { ...formData.fitnessLevel, runningDuration: e.target.value })}
            className={errors.duration ? 'input-error' : ''}
            min="1"
            step="1"
            style={{ paddingRight: '48px' }}
          />
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-500)' }}>นาที</span>
        </div>
        {errors.duration ? (
          <span className="validation-message" role="alert">{errors.duration}</span>
        ) : (
          <span className="helper-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: '4px', display: 'block' }}>
            ไม่ต้องกังวลเรื่องเวลา ทุกคนมีจุดเริ่มต้นของตัวเอง
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn btn-secondary btn-md w-full" onClick={onPrev}>
          ย้อนกลับ
        </button>
        <button className="btn btn-primary btn-md btn-cta w-full" onClick={handleNext}>
          เช็กจุดเริ่มต้นแล้ว ไปต่อ
        </button>
      </div>
    </div>
  );
}
