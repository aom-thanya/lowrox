import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

// Temporary Mock Enums
const CONSTRAINT_OPTIONS = [
  { value: 'location_time', label: 'สถานที่และเวลา' },
  { value: 'time_only', label: 'เวลาอย่างเดียว' }
];

const AREA_OPTIONS = [
  { value: 'park', label: 'สวนสาธารณะ' },
  { value: 'gym', label: 'ฟิตเนส' },
  { value: 'stadium', label: 'สนามกีฬากลาง' },
  { value: 'other', label: 'อื่นๆ' }
];

const DAY_OPTIONS = [
  { value: 'monday', label: 'วันจันทร์' },
  { value: 'tuesday', label: 'วันอังคาร' },
  { value: 'wednesday', label: 'วันพุธ' },
  { value: 'thursday', label: 'วันพฤหัสบดี' },
  { value: 'friday', label: 'วันศุกร์' },
  { value: 'saturday', label: 'วันเสาร์' },
  { value: 'sunday', label: 'วันอาทิตย์' }
];

export default function StepAvailability({ onNext, onPrev }) {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    formData.constraints.forEach((constraint, index) => {
      newErrors[index] = {};
      if (!constraint.areaLabel || constraint.areaLabel.trim() === '') {
        newErrors[index].areaLabel = 'บอกพื้นที่ที่สะดวกก่อนนะ';
        isValid = false;
      }
      if (!constraint.dayOfWeek) {
        newErrors[index].dayOfWeek = 'เลือกวันที่คุณสะดวก แล้วไปต่อกัน';
        isValid = false;
      }
      if (!constraint.availableFrom || !constraint.availableTo) {
        newErrors[index].time = 'เลือกช่วงเวลาที่สะดวกให้ครบก่อนนะ';
        isValid = false;
      } else if (constraint.availableFrom >= constraint.availableTo) {
        newErrors[index].time = 'เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด ลองสลับเวลาอีกครั้ง';
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

  const updateConstraint = (index, field, value) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = { ...newConstraints[index], [field]: value };
    updateFormData('constraints', newConstraints);
  };

  const addConstraint = () => {
    updateFormData('constraints', [...formData.constraints, { id: Date.now().toString(), constraintType: 'location_time', areaType: '', areaLabel: '', dayOfWeek: '', availableFrom: '', availableTo: '', weeklyFrequency: '', note: '' }]);
  };

  const removeConstraint = (index) => {
    if (formData.constraints.length > 1) {
      const newConstraints = formData.constraints.filter((_, i) => i !== index);
      updateFormData('constraints', newConstraints);
    }
  };

  return (
    <div className="onboarding-section">
      <h2 className="display-sm" style={{ marginBottom: '8px' }}>จังหวะไหนที่เข้ากับชีวิตคุณ?</h2>
      <p className="body-md" style={{ color: 'var(--color-neutral-600)', marginBottom: '24px' }}>
        ไม่ต้องฝืนตารางชีวิต เลือกพื้นที่และเวลาที่คุณสะดวกจริง แล้วเราจะช่วยหาโอกาสซ้อมที่ไปด้วยกันได้
      </p>

      <div className="onboarding-dynamic-list" style={{ marginBottom: '24px' }}>
        {formData.constraints.map((constraint, index) => (
          <div key={constraint.id} className="onboarding-card">
            <div className="onboarding-card-header">
              <strong style={{ fontSize: 'var(--font-size-md)' }}>ช่วงเวลาที่ {index + 1}</strong>
              {formData.constraints.length > 1 && (
                <button type="button" className="btn-remove-card" onClick={() => removeConstraint(index)}>
                  ลบช่วงเวลานี้
                </button>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor={`areaLabel-${index}`}>พื้นที่ที่สะดวก</label>
              <input 
                type="text" 
                id={`areaLabel-${index}`} 
                placeholder="เช่น สวนลุมพินี" 
                value={constraint.areaLabel}
                onChange={(e) => updateConstraint(index, 'areaLabel', e.target.value)}
                className={errors[index]?.areaLabel ? 'input-error' : ''}
              />
              {errors[index]?.areaLabel && (
                <span className="validation-message" role="alert">{errors[index].areaLabel}</span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor={`areaType-${index}`}>ประเภทพื้นที่</label>
              <select 
                id={`areaType-${index}`} 
                value={constraint.areaType}
                onChange={(e) => updateConstraint(index, 'areaType', e.target.value)}
              >
                <option value="" disabled>เลือกประเภทพื้นที่</option>
                {AREA_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor={`dayOfWeek-${index}`}>วันที่สะดวก</label>
              <select 
                id={`dayOfWeek-${index}`} 
                value={constraint.dayOfWeek}
                onChange={(e) => updateConstraint(index, 'dayOfWeek', e.target.value)}
                className={errors[index]?.dayOfWeek ? 'input-error' : ''}
              >
                <option value="" disabled>เลือกวัน</option>
                {DAY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors[index]?.dayOfWeek && (
                <span className="validation-message" role="alert">{errors[index].dayOfWeek}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label htmlFor={`availableFrom-${index}`}>ตั้งแต่เวลา</label>
                <input 
                  type="time" 
                  id={`availableFrom-${index}`} 
                  value={constraint.availableFrom}
                  onChange={(e) => updateConstraint(index, 'availableFrom', e.target.value)}
                  className={errors[index]?.time ? 'input-error' : ''}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label htmlFor={`availableTo-${index}`}>ถึงเวลา</label>
                <input 
                  type="time" 
                  id={`availableTo-${index}`} 
                  value={constraint.availableTo}
                  onChange={(e) => updateConstraint(index, 'availableTo', e.target.value)}
                  className={errors[index]?.time ? 'input-error' : ''}
                />
              </div>
            </div>
            {errors[index]?.time && (
              <span className="validation-message" style={{ display: 'block', marginBottom: '16px' }} role="alert">{errors[index].time}</span>
            )}

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor={`weeklyFrequency-${index}`}>อยากซ้อมกี่วันต่อสัปดาห์</label>
              <input 
                type="number" 
                id={`weeklyFrequency-${index}`} 
                placeholder="เลือกจำนวนวัน" 
                value={constraint.weeklyFrequency}
                onChange={(e) => updateConstraint(index, 'weeklyFrequency', e.target.value)}
                min="1"
                max="7"
                step="1"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label htmlFor={`note-${index}`}>มีอะไรอยากบอกเราเพิ่มไหม?</label>
              <textarea 
                id={`note-${index}`} 
                placeholder="เช่น สะดวกเฉพาะหลังเลิกงาน" 
                value={constraint.note}
                onChange={(e) => updateConstraint(index, 'note', e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '12px', border: '1px solid var(--color-neutral-300)', borderRadius: '8px' }}
              ></textarea>
              <span className="helper-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: '4px', display: 'block' }}>
                ไม่จำเป็นต้องกรอก หากไม่มีข้อจำกัดเพิ่มเติม
              </span>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-add-card" onClick={addConstraint} style={{ marginBottom: '32px' }}>
        + เพิ่มวันหรือช่วงเวลา
      </button>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn btn-secondary btn-md w-full" onClick={onPrev}>
          ย้อนกลับ
        </button>
        <button className="btn btn-primary btn-md btn-cta w-full" onClick={handleNext}>
          ได้เวลาที่ลงตัวแล้ว ไปต่อ
        </button>
      </div>
    </div>
  );
}
