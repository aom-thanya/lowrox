import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import PageHeader from '../components/common/PageHeader';
import ContentCard from '../components/common/ContentCard';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import Skeleton from '../components/common/Skeleton';

import StepBasicInfo from '../components/onboarding/StepBasicInfo';
import StepFitnessLevel from '../components/onboarding/StepFitnessLevel';
import StepGoals from '../components/onboarding/StepGoals';
import StepAvailability from '../components/onboarding/StepAvailability';
import StepHealth from '../components/onboarding/StepHealth';

// Inner component that has access to the OnboardingContext
function ProfileOnboardingEditorForm({ onCancel, initialData }) {
  const { formData, updateFormData } = useOnboarding();
  const { saveOnboardingData } = useAuth();
  const { setDirty } = useUnsavedChanges();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Use refs to call validate on each step
  const step1Ref = useRef();
  const step2Ref = useRef();
  const step3Ref = useRef();
  const step4Ref = useRef();
  const step5Ref = useRef();

  // Check if dirty
  const isDirty = initialData ? JSON.stringify(initialData) !== JSON.stringify(formData) : false;

  useEffect(() => {
    setDirty(isDirty);
  }, [isDirty, setDirty]);

  useEffect(() => {
    return () => setDirty(false);
  }, [setDirty]);

  const dismissToast = useCallback(() => setToast(''), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    setSaveError('');

    // Validate all steps
    const valid1 = step1Ref.current?.validate ? step1Ref.current.validate() : true;
    const valid2 = step2Ref.current?.validate ? step2Ref.current.validate() : true;
    const valid3 = step3Ref.current?.validate ? step3Ref.current.validate() : true;
    const valid4 = step4Ref.current?.validate ? step4Ref.current.validate() : true;
    const valid5 = step5Ref.current?.validate ? step5Ref.current.validate() : true;

    if (!valid1 || !valid2 || !valid3 || !valid4 || !valid5) {
      setSaveError('กรุณาตรวจสอบข้อมูลที่กรอกให้ครบถ้วน');
      return;
    }

    setSaving(true);
    try {
      await saveOnboardingData(formData);
      setToast('บันทึกข้อมูลสำเร็จ');
      setDirty(false);
      // Optional: navigate back or stay on page
    } catch (err) {
      setSaveError('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDirty(false);
    onCancel();
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={saving}>
        <ContentCard>
          <section>
            <h2 className="heading-4 mb-4">ข้อมูลพื้นฐาน</h2>
            <p className="field-helper section-description mb-16">ข้อมูลนี้จะช่วยให้ Lowrox ปรับแต่งประสบการณ์และเป้าหมายให้เหมาะกับคุณที่สุด</p>
            <StepBasicInfo ref={step1Ref} isEditor={true} externalShowValidation={showValidation} />
          </section>
        </ContentCard>

        <ContentCard>
          <section>
            <h2 className="heading-4 mb-4">สถิติปัจจุบัน</h2>
            <p className="field-helper section-description mb-16">ไม่ต้องเป็นสถิติที่ดีที่สุด เลือกครั้งที่ใกล้เคียงกับคุณที่สุดได้เลย</p>
            <StepFitnessLevel ref={step2Ref} isEditor={true} externalShowValidation={showValidation} />
          </section>
        </ContentCard>

        <ContentCard>
          <section>
            <h2 className="heading-4 mb-4">เป้าหมาย & Challenge</h2>
            <p className="field-helper section-description mb-16">กำหนดเป้าหมายเพื่อเป็นแรงบันดาลใจในการออกกำลังกายของคุณ</p>
            <StepGoals ref={step3Ref} isEditor={true} externalShowValidation={showValidation} />
          </section>
        </ContentCard>

        <ContentCard>
          <section>
            <h2 className="heading-4 mb-4">ช่วงเวลาที่สะดวก</h2>
            <p className="field-helper section-description mb-16">เลือกช่วงที่มักสะดวก เราจะช่วยหา Buddy และ Training Party ที่เข้ากับคุณ</p>
            <StepAvailability ref={step4Ref} isEditor={true} externalShowValidation={showValidation} />
          </section>
        </ContentCard>

        <ContentCard>
          <section>
            <h2 className="heading-4 mb-4">สุขภาพและข้อควรระวัง</h2>
            <p className="field-helper section-description mb-16">บอกเฉพาะเรื่องที่เกี่ยวข้องกับการออกกำลังกาย เพื่อให้คำแนะนำเหมาะกับคุณมากขึ้น</p>
            <StepHealth ref={step5Ref} isEditor={true} externalShowValidation={showValidation} />
          </section>
        </ContentCard>

        {saveError && <p className="form-feedback field-error" role="alert">{saveError}</p>}
        <div className="form-actions profile-actions mt-24">
          <Button variant="secondary" onClick={handleCancel} disabled={saving || !isDirty}>ยกเลิก</Button>
          <Button type="submit" disabled={!isDirty || saving} loading={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}</Button>
        </div>
      </fieldset>
      <Toast message={toast} onDismiss={dismissToast} />
    </form>
  );
}

export default function ProfileOnboardingEditor() {
  const { loadOnboardingData } = useAuth();
  const [status, setStatus] = useState('loading');
  const [initialData, setInitialData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'แก้ไขข้อมูลจาก Onboarding | Lowrox';
    return () => { document.title = oldTitle; };
  }, []);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await loadOnboardingData();
      setInitialData(data); // Can be null if never saved, OnboardingProvider handles default
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [loadOnboardingData]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <>
      <PageHeader title="แก้ไขข้อมูลจาก Onboarding" description="อัปเดตเป้าหมายและความต้องการ เพื่อหา Buddy ที่เหมาะกับคุณ" />
      
      {status === 'loading' && (
        <ContentCard>
          <div className="profile-skeleton" role="status" aria-label="กำลังโหลดข้อมูล">
            <Skeleton /><Skeleton /><Skeleton />
          </div>
        </ContentCard>
      )}
      
      {status === 'error' && (
        <ContentCard>
          <div className="load-error">
            <p role="alert">โหลดข้อมูลไม่สำเร็จ</p>
            <Button onClick={load}>ลองอีกครั้ง</Button>
          </div>
        </ContentCard>
      )}

      {status === 'ready' && (
        <OnboardingProvider initialData={initialData}>
          <ProfileOnboardingEditorForm onCancel={handleCancel} initialData={initialData} />
        </OnboardingProvider>
      )}
    </>
  );
}
