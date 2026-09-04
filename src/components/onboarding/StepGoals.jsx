import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

// Temporary Mock Enum
const GOAL_OPTIONS = [
  { value: 'distance', label: 'เพิ่มระยะทางวิ่ง' },
  { value: 'pace', label: 'วิ่งให้เร็วขึ้น (Pace)' },
  { value: 'weight_loss', label: 'ลดน้ำหนัก' },
  { value: 'health', label: 'เพื่อสุขภาพที่ดี' },
  { value: 'competition', label: 'เตรียมลงแข่งขัน' }
];

export default function StepGoals({ onNext, onPrev }) {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    formData.goals.forEach((goal, index) => {
      newErrors[index] = {};
      if (!goal.goalType) {
        newErrors[index].goalType = 'เลือกเป้าหมายที่อยากไปให้ถึงก่อนนะ';
        isValid = false;
      }
      if (!goal.targetValue || goal.targetValue.trim() === '') {
        newErrors[index].targetValue = 'บอกเราอีกนิดว่าอยากทำอะไรให้สำเร็จ';
        isValid = false;
      }
      if (!goal.targetDate) {
        newErrors[index].targetDate = 'ลองเลือกวันที่เป้าหมายใหม่อีกครั้ง';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const updateGoal = (index, field, value) => {
    const newGoals = [...formData.goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    updateFormData('goals', newGoals);
  };

  const addGoal = () => {
    updateFormData('goals', [...formData.goals, { id: Date.now().toString(), goalType: '', targetValue: '', targetDate: '' }]);
  };

  const removeGoal = (index) => {
    if (formData.goals.length > 1) {
      const newGoals = formData.goals.filter((_, i) => i !== index);
      updateFormData('goals', newGoals);
    }
  };

  return (
    <div className="onboarding-section">
      <h2 className="display-sm" style={{ marginBottom: '8px' }}>เป้าหมายต่อไปคืออะไร?</h2>
      <p className="body-md" style={{ color: 'var(--color-neutral-600)', marginBottom: '24px' }}>
        ไม่ว่าจะเป็นเป้าหมายเล็กหรือใหญ่ แค่มีปลายทางที่ชัด เราก็เริ่มขยับเข้าใกล้มันได้
      </p>

      <div className="onboarding-dynamic-list" style={{ marginBottom: '24px' }}>
        {formData.goals.map((goal, index) => (
          <div key={goal.id} className="onboarding-card">
            <div className="onboarding-card-header">
              <strong style={{ fontSize: 'var(--font-size-md)' }}>เป้าหมายที่ {index + 1}</strong>
              {formData.goals.length > 1 && (
                <button type="button" className="btn-remove-card" onClick={() => removeGoal(index)}>
                  ลบเป้าหมายนี้
                </button>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor={`goalType-${index}`}>เป้าหมายของคุณ</label>
              <select 
                id={`goalType-${index}`} 
                value={goal.goalType}
                onChange={(e) => updateGoal(index, 'goalType', e.target.value)}
                className={errors[index]?.goalType ? 'input-error' : ''}
              >
                <option value="" disabled>เลือกประเภทเป้าหมาย</option>
                {GOAL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors[index]?.goalType && (
                <span className="validation-message" role="alert">{errors[index].goalType}</span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor={`targetValue-${index}`}>อยากทำให้ได้เท่าไร</label>
              <input 
                type="text" 
                id={`targetValue-${index}`} 
                placeholder="ระบุเป้าหมายที่ต้องการ" 
                value={goal.targetValue}
                onChange={(e) => updateGoal(index, 'targetValue', e.target.value)}
                className={errors[index]?.targetValue ? 'input-error' : ''}
              />
              {errors[index]?.targetValue ? (
                <span className="validation-message" role="alert">{errors[index].targetValue}</span>
              ) : (
                <span className="helper-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: '4px', display: 'block' }}>
                  เขียนให้ชัดในแบบที่คุณเข้าใจ เช่น ระยะทาง เวลา หรือผลลัพธ์ที่อยากทำได้
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label htmlFor={`targetDate-${index}`}>อยากทำให้สำเร็จภายในวันที่</label>
              <input 
                type="date" 
                id={`targetDate-${index}`} 
                value={goal.targetDate}
                onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
                className={errors[index]?.targetDate ? 'input-error' : ''}
              />
              {errors[index]?.targetDate && (
                <span className="validation-message" role="alert">{errors[index].targetDate}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-add-card" onClick={addGoal} style={{ marginBottom: '32px' }}>
        + เพิ่มอีกหนึ่งเป้าหมาย
      </button>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn btn-secondary btn-md w-full" onClick={onPrev}>
          ย้อนกลับ
        </button>
        <button className="btn btn-primary btn-md btn-cta w-full" onClick={handleNext}>
          ล็อกเป้าหมายแล้ว ไปต่อ
        </button>
      </div>
    </div>
  );
}
