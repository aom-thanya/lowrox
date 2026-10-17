import React, { useState } from 'react';
import { Bandage, Check, Footprints, HeartPulse, Lightbulb, Lock, Pill, ShieldCheck, Timer, Users, type LucideIcon } from 'lucide-react';
import type { HealthConcern, OnboardingData } from '../../types/models';
import { useOnboarding } from '../../context/OnboardingContext';
import PillGroup from '../common/PillGroup';
import Sparkles from '../common/Sparkles';
import { fiveKEquivalent, formatPace, isPlausibleEffort, summarizeLevel } from '../../utils/leveling';

// Three-screen onboarding: the runner sees their level on the first screen, the rest is one tap each.
// Details (birth date, availability, health specifics) can be added later in the profile editor.

const DISTANCES = [
  { value: '3', label: '3 กม.' },
  { value: '5', label: '5 กม.' },
  { value: '10', label: '10 กม.' },
  { value: 'not_tracked', label: 'ยังไม่เคยจับเวลา' },
];

function StepShell({ title, lead, children, footer }: { title: string; lead: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <>
      <div className="onboarding-modal-body">
        <div className="mx-auto grid w-full max-w-xl gap-6">
          <div className="grid gap-2">
            <h2 className="heading-2">{title}</h2>
            <p className="text-neutral-600">{lead}</p>
          </div>
          {children}
        </div>
      </div>
      <div className="onboarding-modal-footer">{footer}</div>
    </>
  );
}

export function QuickRunStep() {
  const { formData, updateFormData, nextStep } = useOnboarding();
  const fitness = formData.fitnessLevel;
  const [distance, setDistance] = useState(fitness.distanceSelection || '5');
  const [minutes, setMinutes] = useState(String(fitness.runningDuration || ''));
  const notTracked = distance === 'not_tracked';
  const effort = { distanceKm: Number(distance), durationMin: Number(minutes) };
  const preview = !notTracked && isPlausibleEffort(effort) ? summarizeLevel(fiveKEquivalent(effort)) : null;

  const next = () => {
    updateFormData('fitnessLevel', {
      ...fitness,
      distanceSelection: distance,
      runningDistance: notTracked ? '' : distance,
      durationSelection: notTracked ? '' : 'custom',
      customDurationHours: notTracked ? '' : '0',
      customDurationMinutes: notTracked ? '' : minutes,
      runningDuration: notTracked ? '' : minutes,
    });
    nextStep();
  };

  return (
    <StepShell
      title="ครั้งล่าสุดวิ่งได้เท่าไร?"
      lead="ตอบคร่าว ๆ ก็พอ ไม่ต้องเป็นสถิติที่ดีที่สุด แล้วเราจะบอกเลเวลให้ทันที"
      footer={
        <button type="button" className="btn btn-primary btn-md btn-cta w-full" onClick={next} disabled={!notTracked && !preview}>
          {notTracked ? 'ข้ามไปก่อน →' : 'ไปต่อ →'}
        </button>
      }
    >
      <PillGroup options={DISTANCES} value={distance} onSelect={setDistance} className="gap-2" />

      {!notTracked && (
        <label className="grid gap-2">
          <span className="font-semibold">ใช้เวลาประมาณกี่นาที</span>
          <span className="flex items-center gap-3">
            <input
              className="form-control w-32 text-center text-2xl font-bold"
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="เช่น 35"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              autoFocus
            />
            <span className="text-neutral-500">นาที</span>
          </span>
        </label>
      )}

      <div className="relative min-h-28 overflow-hidden rounded-xl bg-black p-6 text-white" aria-live="polite">
        {preview ? (
          <>
            <Sparkles points={[{ top: '14%', left: '86%', size: 16, delay: 0 }, { top: '64%', left: '92%', size: 10, delay: 0.7 }]} />
            <p className="text-sm text-neutral-400">เลเวลของคุณ</p>
            <p className="text-3xl font-bold text-brand-400">{preview.level.label}</p>
            <p className="mt-1 text-sm text-neutral-300">Pace {formatPace(effort)} /กม.{preview.next ? ` · เป้าถัดไป ${preview.next.label}` : ''}</p>
          </>
        ) : (
          <p className="text-neutral-400">{notTracked ? 'ไม่เป็นไร บันทึกการวิ่งครั้งแรกทีหลังได้ เราจะบอกเลเวลให้ตอนนั้น' : 'พิมพ์เวลา แล้วเลเวลจะขึ้นตรงนี้'}</p>
        )}
      </div>
    </StepShell>
  );
}

const GOALS: { value: string; label: string; desc: string; icon: LucideIcon }[] = [
  { value: 'improve_time', label: 'วิ่งให้เร็วขึ้น', desc: 'ลดเวลาในระยะเดิม', icon: Timer },
  { value: 'increase_distance', label: 'วิ่งให้ไกลขึ้น', desc: 'เพิ่มระยะทีละก้าว', icon: Footprints },
  { value: 'buddy_event', label: 'หาบัดดี้ลงแข่ง', desc: 'เช่น HYROX Doubles', icon: Users },
  { value: 'recommend_for_me', label: 'ยังไม่แน่ใจ', desc: 'ให้ Lowrox ช่วยแนะนำ', icon: Lightbulb },
];

export function QuickGoalStep() {
  const { formData, updateFormData, nextStep, prevStep } = useOnboarding();
  const current = formData.goals[0];
  const [picked, setPicked] = useState(current?.goalType || '');

  // One tap selects and moves on; the short delay lets the selection register visually.
  const choose = (goalType: string) => {
    setPicked(goalType);
    updateFormData('goals', [{ ...current, goalType }]);
    setTimeout(nextStep, 250);
  };

  return (
    <StepShell
      title="อยากไปให้ถึงอะไร?"
      lead="เลือกอย่างเดียวก่อน เปลี่ยนทีหลังได้เสมอ"
      footer={<button type="button" className="btn btn-secondary btn-md" onClick={prevStep}>← ย้อนกลับ</button>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {GOALS.map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={picked === value}
            onClick={() => choose(value)}
            className={`flex items-center gap-4 rounded-lg border-2 bg-white p-4 text-left transition-all duration-200 hover:border-brand-300 ${picked === value ? 'border-brand-500 bg-brand-50' : 'border-neutral-200'}`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600"><Icon size={24} aria-hidden="true" /></span>
            <span className="grid">
              <span className="font-semibold text-neutral-900">{label}</span>
              <span className="text-sm text-neutral-500">{desc}</span>
            </span>
          </button>
        ))}
      </div>
    </StepShell>
  );
}

const CONCERNS = [
  { value: 'injury', label: 'บาดเจ็บหรือปวด', icon: Bandage },
  { value: 'health_condition', label: 'โรคประจำตัว', icon: HeartPulse },
  { value: 'medication', label: 'ยาที่ต้องใช้', icon: Pill },
];

const toConcern = (type: string, note: string): HealthConcern => ({
  concern_type: type,
  concern_name: type === 'injury' ? (note ? [note] : []) : note,
  medication_name: type === 'medication' ? note : '',
  restriction_level: '',
  restriction_note: note,
  start_date: '',
  end_date: '',
  status: 'active',
  is_active: true,
  custom_concern_name: '',
});

export function QuickSafetyStep({ onFinish }: { onFinish: (latest: Partial<OnboardingData>) => Promise<void> }) {
  const { updateFormData, prevStep } = useOnboarding();
  const [hasConcerns, setHasConcerns] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finish = async (concerns: HealthConcern[]) => {
    const safetyCheck = { mainSelection: concerns.length ? concerns.map(c => c.concern_type) : ['none'], concerns };
    updateFormData('safetyCheck', safetyCheck);
    setSaving(true);
    setError('');
    try {
      await onFinish({ safetyCheck });
    } catch {
      setError('บันทึกไม่สำเร็จ ลองกดอีกครั้ง ข้อมูลยังอยู่ครบ');
      setSaving(false);
    }
  };
  const toggle = (value: string) => setTypes(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);

  return (
    <StepShell
      title="มีเรื่องสุขภาพที่ต้องระวังไหม?"
      lead="เพื่อให้แผนซ้อมเพิ่มความหนักอย่างปลอดภัย โดยเฉพาะก่อนลงสนามโหด ๆ อย่าง HYROX"
      footer={
        hasConcerns ? (
          <>
            <button type="button" className="btn btn-secondary btn-md" onClick={() => setHasConcerns(false)} disabled={saving}>← ย้อนกลับ</button>
            <button type="button" className="btn btn-primary btn-md btn-cta w-full" disabled={saving || types.length === 0} onClick={() => finish(types.map(type => toConcern(type, note.trim())))}>
              {saving ? 'กำลังเตรียมเลเวลของคุณ…' : 'เสร็จแล้ว ดูเลเวลของฉัน →'}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-secondary btn-md" onClick={prevStep} disabled={saving}>← ย้อนกลับ</button>
        )
      }
    >
      {!hasConcerns ? (
        <div className="grid gap-3">
          <button type="button" disabled={saving} onClick={() => finish([])} className="flex items-center gap-4 rounded-lg border-2 border-success bg-success-soft p-5 text-left transition-all duration-200 hover:shadow-md">
            <ShieldCheck size={28} className="shrink-0 text-success" aria-hidden="true" />
            <span className="grid">
              <span className="font-semibold text-neutral-900">{saving ? 'กำลังเตรียมเลเวลของคุณ…' : 'ไม่มี พร้อมลุย'}</span>
              <span className="text-sm text-neutral-600">ไปดูเลเวลและแผนซ้อมของคุณเลย</span>
            </span>
          </button>
          <button type="button" disabled={saving} onClick={() => setHasConcerns(true)} className="flex items-center gap-4 rounded-lg border-2 border-neutral-200 bg-white p-5 text-left transition-all duration-200 hover:border-brand-300">
            <HeartPulse size={28} className="shrink-0 text-brand-500" aria-hidden="true" />
            <span className="grid">
              <span className="font-semibold text-neutral-900">มี ขอบอกหน่อย</span>
              <span className="text-sm text-neutral-600">เราจะปรับแผนให้เบาลง</span>
            </span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={types.includes(value)}
                onClick={() => toggle(value)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-semibold transition-all duration-200 ${types.includes(value) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white text-neutral-700'}`}
              >
                {types.includes(value) ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}{label}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            อยากให้เราระวังอะไรเป็นพิเศษ (ไม่บังคับ)
            <textarea className="form-control font-normal" rows={3} maxLength={300} placeholder="เช่น ปวดเข่าเวลาวิ่งลงเขา" value={note} onChange={e => setNote(e.target.value)} />
          </label>
        </div>
      )}

      <p className="flex items-start gap-2 text-sm text-neutral-500"><Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />ข้อมูลนี้เป็นความลับ ใช้ปรับคำแนะนำเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</p>
      {error && <p className="text-sm text-error" role="alert">{error}</p>}
    </StepShell>
  );
}
