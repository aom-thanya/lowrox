import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function ReviewSection({ title, onEdit, className = 'mb-16', children }: { title: string; onEdit: () => void; className?: string; children: React.ReactNode }) {
  return (
    <div className={`onboarding-card ${className}`}>
      <div className="onboarding-card-header mb-2">
        <strong className="text-base">{title}</strong>
        <button type="button" className="btn-remove-card text-brand-600" onClick={onEdit}>แก้ไข</button>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function StepReview({ onPrev, onSubmit, redirectDestination = '/level' }: { onPrev: () => void; onSubmit?: () => void; redirectDestination?: string }) {
  const { formData, goToStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit?.();
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
          <h2 className="heading-2 mb-2">เช็กความพร้อมครั้งสุดท้าย</h2>
          <p className="body-md text-neutral-600">
            นี่คือข้อมูลที่จะช่วยให้เราเข้าใจคุณ ลองเช็กอีกครั้ง ถ้าทุกอย่างโอเค เราไปต่อด้วยกันเลย
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message-area mb-4">
          <strong>สะดุดนิดหน่อย แต่ข้อมูลยังอยู่ครบ</strong><br/>
          {error}
        </div>
      )}

      {/* Basic Info */}
      <ReviewSection title="ข้อมูลพื้นฐาน" onEdit={() => goToStep(1)}>
        <p><strong>อายุ:</strong> {formData.demographics.age}</p>
        <p><strong>เพศ:</strong> {formData.demographics.gender}</p>
      </ReviewSection>

      {/* Fitness Level */}
      <ReviewSection title="จุดเริ่มต้นของคุณ" onEdit={() => goToStep(2)}>
        <p><strong>ระยะทาง:</strong> {formData.fitnessLevel.runningDistance} กม.</p>
        <p><strong>เวลา:</strong> {formData.fitnessLevel.runningDuration} นาที</p>
      </ReviewSection>

      {/* Goals */}
      <ReviewSection title="เป้าหมายที่อยากไปให้ถึง" onEdit={() => goToStep(3)}>
        {formData.goals.map((g, i) => (
          <div key={g.id} className="mb-2">
            <p><strong>เป้าหมาย {i+1}:</strong> {g.goalType} - {g.targetValue} (ภายใน {g.targetDate})</p>
          </div>
        ))}
      </ReviewSection>

      {/* Constraints */}
      <ReviewSection title="พื้นที่และเวลาที่สะดวก" onEdit={() => goToStep(4)}>
        {formData.constraints?.map((c, i) => (
          <div key={c.id} className="mb-2">
            <p><strong>ช่วงที่ {i+1}:</strong> {c.areaLabel} ({c.dayOfWeek} {c.availableFrom}-{c.availableTo})</p>
          </div>
        ))}
      </ReviewSection>

      {/* Health */}
      <ReviewSection title="ข้อมูลสุขภาพ" onEdit={() => goToStep(5)} className="mb-8">
        {formData.health?.hasConcerns === false ? (
          <p>ไม่มีข้อมูลสุขภาพที่ต้องระบุ</p>
        ) : (
          formData.health?.concerns.map((h, i) => (
            <div key={h.id} className="mb-2">
              <p><strong>อาการที่ {i+1}:</strong> {h.concernName} ({h.concernType})</p>
            </div>
          ))
        )}
      </ReviewSection>
      </div>
      
      <div className="onboarding-modal-footer">
        <button className="btn btn-secondary btn-sm w-auto mr-4 flex items-center gap-1" onClick={onPrev} disabled={isSubmitting}>
          <ArrowLeft size={16} /> ย้อนกลับ
        </button>
        <button className="btn btn-primary btn-md btn-cta w-full flex items-center justify-center gap-1" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'กำลังเตรียมโปรไฟล์ให้คุณ...' : (
            <>
              ยืนยัน แล้วไปดูเลเวลของฉัน <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
