import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

// Temporary Mock Enum
const GENDER_OPTIONS = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่นๆ' },
  { value: 'prefer_not_to_say', label: 'ไม่ระบุ' }
];

export default function StepBasicInfo({ onNext }) {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.demographics.age) {
      newErrors.age = 'บอกอายุเรานิดหนึ่ง แล้วไปต่อกัน';
    } else if (isNaN(formData.demographics.age) || formData.demographics.age <= 0 || !Number.isInteger(Number(formData.demographics.age))) {
      newErrors.age = 'ดูเหมือนอายุยังไม่ถูกต้อง ลองเช็กอีกครั้งนะ';
    }
    
    if (!formData.demographics.gender) {
      newErrors.gender = 'เลือกเพศก่อน แล้วเราไปขั้นต่อไปกัน';
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
      <h2 className="display-sm" style={{ marginBottom: '8px' }}>เริ่มจากทำความรู้จักกันก่อน</h2>
      <p className="body-md" style={{ color: 'var(--color-neutral-600)', marginBottom: '24px' }}>
        เล่าเรื่องพื้นฐานของคุณให้เรารู้หน่อย จะได้เตรียมเส้นทางที่เหมาะกับคุณมากขึ้น
      </p>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label htmlFor="age">อายุ</label>
        <input 
          type="number" 
          id="age" 
          placeholder="เช่น 30" 
          value={formData.demographics.age}
          onChange={(e) => updateFormData('demographics', { ...formData.demographics, age: e.target.value })}
          className={errors.age ? 'input-error' : ''}
          min="1"
          step="1"
        />
        {errors.age ? (
          <span className="validation-message" role="alert">{errors.age}</span>
        ) : (
          <span className="helper-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: '4px', display: 'block' }}>
            กรอกอายุปัจจุบันของคุณ
          </span>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '32px' }}>
        <label htmlFor="gender">เพศ</label>
        <select 
          id="gender" 
          value={formData.demographics.gender}
          onChange={(e) => updateFormData('demographics', { ...formData.demographics, gender: e.target.value })}
          className={errors.gender ? 'input-error' : ''}
        >
          <option value="" disabled>เลือกเพศ</option>
          {GENDER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.gender ? (
          <span className="validation-message" role="alert">{errors.gender}</span>
        ) : (
          <span className="helper-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: '4px', display: 'block' }}>
            เลือกตามข้อมูลที่คุณสะดวกให้เราใช้
          </span>
        )}
      </div>

      <button className="btn btn-primary btn-md btn-cta w-full" onClick={handleNext}>
        รู้จักกันแล้ว ไปต่อ
      </button>
    </div>
  );
}
