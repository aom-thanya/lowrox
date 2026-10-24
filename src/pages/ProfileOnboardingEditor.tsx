import type { OnboardingData } from '../types/models';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import PageHeader from '../components/common/PageHeader';
import ContentCard from '../components/common/ContentCard';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import Skeleton from '../components/common/Skeleton';

import { QuickGoalStep, QuickRhythmStep, QuickRunStep, QuickSafetyStep } from '../components/onboarding/QuickSteps';
import { isPlausibleEffort } from '../utils/leveling';

const STEPS = [
  { label: 'วิ่ง', Step: QuickRunStep },
  { label: 'เป้าหมาย', Step: QuickGoalStep },
  { label: 'สุขภาพ', Step: QuickSafetyStep },
  { label: 'เวลาและพื้นที่', Step: QuickRhythmStep },
];

// A tracked run must be one a person could actually run, or the level would be wrong.
const runIsValid = (fitness: OnboardingData['fitnessLevel']) =>
  !fitness.distanceSelection || fitness.distanceSelection === 'not_tracked'
  || isPlausibleEffort({ distanceKm: Number(fitness.distanceSelection), durationMin: Number(fitness.runningDuration) });

// The same screens as onboarding, one at a time, but free to jump between and saved in one go.
function ProfileOnboardingEditorForm({ initialData, onReset, onSaved }: { initialData: OnboardingData | null; onReset: () => void; onSaved: (data: OnboardingData) => void }) {
  const { formData } = useOnboarding();
  const { saveOnboardingData } = useAuth();
  const { setDirty } = useUnsavedChanges();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');
  // Nothing saved yet means any answers are new.
  const isDirty = initialData === null || JSON.stringify(initialData) !== JSON.stringify(formData);
  const last = step === STEPS.length - 1;
  const { Step } = STEPS[step];

  useEffect(() => { setDirty(isDirty); }, [isDirty, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);
  const dismissToast = useCallback(() => setToast(''), []);

  const save = async () => {
    setSaveError('');
    if (!runIsValid(formData.fitnessLevel)) {
      setStep(0);
      setSaveError('เวลาวิ่งดูไม่สมจริง ลองเช็คนาทีอีกครั้ง');
      return;
    }
    setSaving(true);
    try {
      await saveOnboardingData(formData);
      onSaved(formData);
      setDirty(false);
      setToast('บันทึกข้อมูลสำเร็จ');
    } catch {
      setSaveError('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentCard className="gap-0! overflow-hidden p-0!">
      <div className="border-b border-neutral-200 px-5 pt-5 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="ขั้นตอน">
            {STEPS.map((item, index) => (
              <button key={item.label} type="button" role="tab" aria-selected={index === step} onClick={() => setStep(index)}
                className={`min-h-10 shrink-0 cursor-pointer rounded-full border-0 px-4 font-[inherit] text-sm whitespace-nowrap transition-colors ${index === step ? 'bg-brand-500 font-semibold text-white' : 'bg-transparent text-neutral-600 hover:bg-neutral-100'}`}>
                {index + 1}. {item.label}
              </button>
            ))}
          </div>
          <span className="onboarding-step-text shrink-0 text-sm">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="onboarding-progress-bar mt-4 mb-0">
          <div className="onboarding-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}></div>
        </div>
      </div>

      <fieldset disabled={saving} className="m-0 min-w-0 border-0 p-5 md:p-8" role="tabpanel" aria-label={STEPS[step].label}>
        <div className="mx-auto w-full max-w-xl">
          <Step editor />
        </div>
      </fieldset>

      {saveError && <p className="form-feedback field-error mx-5 mb-4 md:mx-8" role="alert">{saveError}</p>}
      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 px-5 py-4 md:px-8">
        {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={saving}>← ย้อนกลับ</Button>}
        {isDirty && (
          <button type="button" onClick={onReset} disabled={saving}
            className="min-h-11 cursor-pointer border-0 bg-transparent px-2 font-[inherit] text-sm font-semibold text-neutral-600 underline underline-offset-2 hover:text-neutral-900">
            ยกเลิกการเปลี่ยนแปลง
          </button>
        )}
        <div className="ml-auto flex gap-3">
          {!last && <Button variant="secondary" onClick={() => setStep(step + 1)} disabled={saving}>ถัดไป →</Button>}
          <Button onClick={save} disabled={!isDirty || saving} loading={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}</Button>
        </div>
      </div>
      <Toast message={toast} onDismiss={dismissToast} />
    </ContentCard>
  );
}

export default function ProfileOnboardingEditor() {
  const { loadOnboardingData } = useAuth();
  const [status, setStatus] = useState('loading');
  const [initialData, setInitialData] = useState<OnboardingData | null>(null);

  useDocumentTitle('แก้ไขข้อมูลจาก Onboarding | Lowrox');

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

  // Throwing away edits remounts the form on the saved answers.
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <PageHeader title="แก้ไขข้อมูลจาก Onboarding" description="คำถามชุดเดียวกับตอนเริ่มใช้งาน แก้ข้อไหนก็ได้ แล้วกดบันทึกทีเดียว" />
      
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
        <OnboardingProvider key={resetKey} initialData={initialData}>
          <ProfileOnboardingEditorForm initialData={initialData} onReset={() => setResetKey(key => key + 1)} onSaved={setInitialData} />
        </OnboardingProvider>
      )}
    </>
  );
}
