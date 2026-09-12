import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function StepReview({ onPrev, onSubmit }) {
  const { formData, goToStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit();
    } catch (err) {
      setError('ตอนนี้เรายังบันทึกข้อมูลไม่ได้ ลองอีกครั้งได้เลย ไม่ต้องเริ่มกรอกใหม่');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="onboarding-modal-body">
        <div className="onboarding-fullwidth-header">
        <div className="onboarding-text-align">
          <h2 className="heading-2 mb-8">เช็กความพร้อมครั้งสุดท้าย</h2>
          <p className="body-md text-neutral-600">
            นี่คือข้อมูลที่จะช่วยให้เราเข้าใจคุณ ลองเช็กอีกครั้ง ถ้าทุกอย่างโอเค เราไปต่อด้วยกันเลย
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message-area mb-16">
          <strong>สะดุดนิดหน่อย แต่ข้อมูลยังอยู่ครบ</strong><br/>
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="onboarding-card mb-16">
        <div className="onboarding-card-header mb-8">
          <strong className="text-[var(--font-size-md)]">ข้อมูลพื้นฐาน</strong>
          <button type="button" className="btn-remove-card text-brand-600" onClick={() => goToStep(1)}>แก้ไข</button>
        </div>
        <div className="text-[var(--font-size-sm)]">
          <p><strong>อายุ:</strong> {formData.demographics.age}</p>
          <p><strong>เพศ:</strong> {formData.demographics.gender}</p>
        </div>
      </div>

      {/* Fitness Level */}
      <div className="onboarding-card mb-16">
        <div className="onboarding-card-header mb-8">
          <strong className="text-[var(--font-size-md)]">จุดเริ่มต้นของคุณ</strong>
          <button type="button" className="btn-remove-card text-brand-600" onClick={() => goToStep(2)}>แก้ไข</button>
        </div>
        <div className="text-[var(--font-size-sm)]">
          <p><strong>ระยะทาง:</strong> {formData.fitnessLevel.runningDistance} กม.</p>
          <p><strong>เวลา:</strong> {formData.fitnessLevel.runningDuration} นาที</p>
        </div>
      </div>

      {/* Goals */}
      <div className="onboarding-card mb-16">
        <div className="onboarding-card-header mb-8">
          <strong className="text-[var(--font-size-md)]">เป้าหมายที่อยากไปให้ถึง</strong>
          <button type="button" className="btn-remove-card text-brand-600" onClick={() => goToStep(3)}>แก้ไข</button>
        </div>
        <div className="text-[var(--font-size-sm)]">
          {formData.goals.map((g, i) => (
            <div key={g.id} className="mb-8">
              <p><strong>เป้าหมาย {i+1}:</strong> {g.goalType} - {g.targetValue} (ภายใน {g.targetDate})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="onboarding-card mb-16">
        <div className="onboarding-card-header mb-8">
          <strong className="text-[var(--font-size-md)]">พื้นที่และเวลาที่สะดวก</strong>
          <button type="button" className="btn-remove-card text-brand-600" onClick={() => goToStep(4)}>แก้ไข</button>
        </div>
        <div className="text-[var(--font-size-sm)]">
          {formData.constraints.map((c, i) => (
            <div key={c.id} className="mb-8">
              <p><strong>ช่วงที่ {i+1}:</strong> {c.areaLabel} ({c.dayOfWeek} {c.availableFrom}-{c.availableTo})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health */}
      <div className="onboarding-card mb-32">
        <div className="onboarding-card-header mb-8">
          <strong className="text-[var(--font-size-md)]">ข้อมูลสุขภาพ</strong>
          <button type="button" className="btn-remove-card text-brand-600" onClick={() => goToStep(5)}>แก้ไข</button>
        </div>
        <div className="text-[var(--font-size-sm)]">
          {formData.health.hasConcerns === false ? (
            <p>ไม่มีข้อมูลสุขภาพที่ต้องระบุ</p>
          ) : (
            formData.health.concerns.map((h, i) => (
              <div key={h.id} className="mb-8">
                <p><strong>อาการที่ {i+1}:</strong> {h.concernName} ({h.concernType})</p>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
      
      <div className="onboarding-modal-footer">
        <button className="btn btn-secondary btn-sm w-auto mr-16 flex items-center gap-4" onClick={onPrev} disabled={isSubmitting}>
          <ArrowLeft size={16} /> ย้อนกลับ
        </button>
        <button className="btn btn-primary btn-md btn-cta w-full flex items-center justify-center gap-4" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'กำลังเตรียมโปรไฟล์ให้คุณ...' : (
            <>ยืนยัน แล้วไปดูโปรไฟล์ <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </>
  );
}
