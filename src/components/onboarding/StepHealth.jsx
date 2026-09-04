import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

// Temporary Mock Enums
const CONCERN_TYPE_OPTIONS = [
  { value: 'injury', label: 'อาการบาดเจ็บ' },
  { value: 'disease', label: 'โรคประจำตัว' },
  { value: 'allergy', label: 'ภูมิแพ้' },
  { value: 'other', label: 'อื่นๆ' }
];

const RESTRICTION_LEVEL_OPTIONS = [
  { value: 'low', label: 'ข้อจำกัดเล็กน้อย' },
  { value: 'medium', label: 'ข้อจำกัดปานกลาง' },
  { value: 'high', label: 'ข้อจำกัดสูง' }
];

export default function StepHealth({ onNext, onPrev }) {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (formData.health.hasConcerns === null) {
      newErrors.main = 'เลือกคำตอบที่ตรงกับคุณก่อนนะ';
      isValid = false;
    } else if (formData.health.hasConcerns === true) {
      formData.health.concerns.forEach((concern, index) => {
        newErrors[index] = {};
        if (!concern.concernName || concern.concernName.trim() === '') {
          newErrors[index].concernName = 'บอกอาการหรือข้อกังวลให้เรารู้อีกนิด';
          isValid = false;
        }
        if (concern.startDate && concern.endDate && concern.endDate < concern.startDate) {
          newErrors[index].dates = 'วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มต้น ลองเช็กอีกครั้งนะ';
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const setHasConcerns = (value) => {
    updateFormData('health', {
      hasConcerns: value,
      concerns: value && formData.health.concerns.length === 0 
        ? [{ id: Date.now().toString(), concernType: '', concernName: '', medicationName: '', restrictionLevel: '', restrictionNote: '', startDate: '', endDate: '', isActive: true }] 
        : formData.health.concerns
    });
  };

  const updateConcern = (index, field, value) => {
    const newConcerns = [...formData.health.concerns];
    newConcerns[index] = { ...newConcerns[index], [field]: value };
    updateFormData('health', { ...formData.health, concerns: newConcerns });
  };

  const addConcern = () => {
    const newConcerns = [...formData.health.concerns, { id: Date.now().toString(), concernType: '', concernName: '', medicationName: '', restrictionLevel: '', restrictionNote: '', startDate: '', endDate: '', isActive: true }];
    updateFormData('health', { ...formData.health, concerns: newConcerns });
  };

  const removeConcern = (index) => {
    const newConcerns = formData.health.concerns.filter((_, i) => i !== index);
    if (newConcerns.length === 0) {
      updateFormData('health', { hasConcerns: null, concerns: [] });
    } else {
      updateFormData('health', { ...formData.health, concerns: newConcerns });
    }
  };

  return (
    <div className="onboarding-section">
      <h2 className="display-sm" style={{ marginBottom: '8px' }}>มีอะไรที่เราควรรู้ก่อนออกตัวไหม?</h2>
      <p className="body-md" style={{ color: 'var(--color-neutral-600)', marginBottom: '8px' }}>
        แชร์เฉพาะข้อมูลสุขภาพที่เกี่ยวข้องกับการออกกำลังกาย เพื่อให้เราเข้าใจข้อจำกัดของคุณมากขึ้น
      </p>
      <div style={{ backgroundColor: 'var(--color-neutral-100)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
        <p className="body-sm" style={{ color: 'var(--color-neutral-700)', margin: 0 }}>
          <strong>ข้อมูลนี้เป็นเรื่องส่วนตัว</strong> เลือกบอกเฉพาะสิ่งที่คุณสะดวกได้เลย
        </p>
      </div>

      {errors.main && (
        <div className="error-message-area" style={{ marginBottom: '16px' }}>{errors.main}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <label 
          className={`onboarding-card ${formData.health.hasConcerns === false ? 'selected' : ''}`} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderColor: formData.health.hasConcerns === false ? 'var(--color-primary-500)' : 'var(--color-neutral-200)' }}
        >
          <input 
            type="radio" 
            name="hasConcerns" 
            checked={formData.health.hasConcerns === false} 
            onChange={() => setHasConcerns(false)}
            style={{ margin: 0 }}
          />
          <div>
            <strong style={{ display: 'block', fontSize: 'var(--font-size-md)' }}>ไม่มีข้อมูลสุขภาพที่ต้องระบุ</strong>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>ตอนนี้ไม่มีอาการหรือข้อจำกัดที่ต้องแจ้ง</span>
          </div>
        </label>

        <label 
          className={`onboarding-card ${formData.health.hasConcerns === true ? 'selected' : ''}`} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderColor: formData.health.hasConcerns === true ? 'var(--color-primary-500)' : 'var(--color-neutral-200)' }}
        >
          <input 
            type="radio" 
            name="hasConcerns" 
            checked={formData.health.hasConcerns === true} 
            onChange={() => setHasConcerns(true)}
            style={{ margin: 0 }}
          />
          <div>
            <strong style={{ display: 'block', fontSize: 'var(--font-size-md)' }}>มีข้อมูลที่อยากให้รู้</strong>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>มีอาการ ยา หรือข้อจำกัดที่เกี่ยวข้องกับการออกกำลังกาย</span>
          </div>
        </label>
      </div>

      {formData.health.hasConcerns === true && (
        <div className="onboarding-dynamic-list" style={{ marginBottom: '24px' }}>
          {formData.health.concerns.map((concern, index) => (
            <div key={concern.id} className="onboarding-card">
              <div className="onboarding-card-header">
                <strong style={{ fontSize: 'var(--font-size-md)' }}>ข้อมูลสุขภาพที่ {index + 1}</strong>
                <button type="button" className="btn-remove-card" onClick={() => removeConcern(index)}>
                  ลบข้อมูลนี้
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor={`concernType-${index}`}>ประเภทข้อมูลสุขภาพ</label>
                <select 
                  id={`concernType-${index}`} 
                  value={concern.concernType}
                  onChange={(e) => updateConcern(index, 'concernType', e.target.value)}
                >
                  <option value="" disabled>เลือกประเภท</option>
                  {CONCERN_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor={`concernName-${index}`}>อาการหรือข้อกังวล</label>
                <input 
                  type="text" 
                  id={`concernName-${index}`} 
                  placeholder="ระบุอาการหรือข้อมูลที่เกี่ยวข้อง" 
                  value={concern.concernName}
                  onChange={(e) => updateConcern(index, 'concernName', e.target.value)}
                  className={errors[index]?.concernName ? 'input-error' : ''}
                />
                {errors[index]?.concernName && (
                  <span className="validation-message" role="alert">{errors[index].concernName}</span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor={`medicationName-${index}`}>ยาที่เกี่ยวข้อง</label>
                <input 
                  type="text" 
                  id={`medicationName-${index}`} 
                  placeholder="ระบุชื่อยา หากมี" 
                  value={concern.medicationName}
                  onChange={(e) => updateConcern(index, 'medicationName', e.target.value)}
                />
                <span className="helper-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginTop: '4px', display: 'block' }}>
                  ไม่จำเป็นต้องกรอก หากไม่มียาที่เกี่ยวข้อง
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor={`restrictionLevel-${index}`}>ระดับข้อจำกัด</label>
                <select 
                  id={`restrictionLevel-${index}`} 
                  value={concern.restrictionLevel}
                  onChange={(e) => updateConcern(index, 'restrictionLevel', e.target.value)}
                >
                  <option value="" disabled>เลือกระดับข้อจำกัด</option>
                  {RESTRICTION_LEVEL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor={`restrictionNote-${index}`}>สิ่งที่ควรระวัง</label>
                <textarea 
                  id={`restrictionNote-${index}`} 
                  placeholder="บอกสิ่งที่ควรหลีกเลี่ยงหรือระมัดระวัง" 
                  value={concern.restrictionNote}
                  onChange={(e) => updateConcern(index, 'restrictionNote', e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--color-neutral-300)', borderRadius: '8px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label htmlFor={`startDate-${index}`}>เริ่มมีอาการเมื่อ</label>
                  <input 
                    type="date" 
                    id={`startDate-${index}`} 
                    value={concern.startDate}
                    onChange={(e) => updateConcern(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label htmlFor={`endDate-${index}`}>สิ้นสุดเมื่อ</label>
                  <input 
                    type="date" 
                    id={`endDate-${index}`} 
                    value={concern.endDate}
                    onChange={(e) => updateConcern(index, 'endDate', e.target.value)}
                    disabled={concern.isActive}
                  />
                </div>
              </div>
              {errors[index]?.dates && (
                <span className="validation-message" style={{ display: 'block', marginBottom: '16px' }} role="alert">{errors[index].dates}</span>
              )}

              <div className="form-group" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id={`isActive-${index}`} 
                  checked={concern.isActive}
                  onChange={(e) => updateConcern(index, 'isActive', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor={`isActive-${index}`} style={{ marginBottom: 0 }}>ข้อมูลนี้ยังมีผลอยู่ในปัจจุบัน</label>
              </div>

            </div>
          ))}

          <button type="button" className="btn-add-card" onClick={addConcern} style={{ marginBottom: '32px' }}>
            + เพิ่มข้อมูลสุขภาพ
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn btn-secondary btn-md w-full" onClick={onPrev}>
          ย้อนกลับ
        </button>
        <button className="btn btn-primary btn-md btn-cta w-full" onClick={handleNext}>
          ตรวจข้อมูลก่อนออกตัว
        </button>
      </div>
    </div>
  );
}
