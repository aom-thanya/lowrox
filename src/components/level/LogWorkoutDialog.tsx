import React, { useState } from 'react';
import Dialog from '../common/Dialog';
import Button from '../common/Button';
import PillGroup from '../common/PillGroup';
import { toDateKey } from '../../services/workoutRepository';
import { fiveKEquivalent, formatPace, isPlausibleEffort, summarizeLevel, type WorkoutEffort } from '../../utils/leveling';

const DISTANCE_OPTIONS = [
  { value: '3', label: '3 กม.' },
  { value: '5', label: '5 กม.' },
  { value: '10', label: '10 กม.' },
  { value: '21.1', label: 'ฮาล์ฟ' },
  { value: 'custom', label: 'อื่น ๆ' },
];
const DATE_OPTIONS = [
  { value: 'today', label: 'วันนี้' },
  { value: 'yesterday', label: 'เมื่อวาน' },
  { value: 'custom', label: 'เลือกวัน' },
];

const daysAgo = (days: number) => toDateKey(new Date(Date.now() - days * 86400000));

// Quick run log: distance is preselected, so the usual flow is "type minutes → save".
export default function LogWorkoutDialog({ open, onClose, onSave, defaultDistance = '5' }: {
  open: boolean;
  onClose: () => void;
  onSave: (input: WorkoutEffort & { date: string }) => void;
  defaultDistance?: string;
}) {
  const isPreset = DISTANCE_OPTIONS.some(option => option.value === defaultDistance);
  const [distance, setDistance] = useState(isPreset ? defaultDistance : 'custom');
  const [customDistance, setCustomDistance] = useState(isPreset ? '' : defaultDistance);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [dateChoice, setDateChoice] = useState('today');
  const [customDate, setCustomDate] = useState(daysAgo(0));
  const [submitted, setSubmitted] = useState(false);

  const distanceKm = Number(distance === 'custom' ? customDistance : distance);
  const durationMin = (Number(minutes) || 0) + (Number(seconds) || 0) / 60;
  const effort = { distanceKm, durationMin };
  const secondsValid = seconds === '' || (Number(seconds) >= 0 && Number(seconds) < 60);
  const valid = secondsValid && isPlausibleEffort(effort);
  const preview = valid ? summarizeLevel(fiveKEquivalent(effort)) : null;
  const date = dateChoice === 'today' ? daysAgo(0) : dateChoice === 'yesterday' ? daysAgo(1) : customDate;

  const reset = () => {
    setMinutes(''); setSeconds(''); setDateChoice('today'); setSubmitted(false);
  };
  const close = () => { reset(); onClose(); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!valid || !date) return;
    onSave({ ...effort, date });
    reset();
  };

  let error = '';
  if (submitted && !valid) {
    if (!(distanceKm > 0)) error = 'เลือกหรือกรอกระยะทาง';
    else if (!(durationMin > 0)) error = 'กรอกเวลาที่ใช้วิ่ง';
    else if (!secondsValid) error = 'วินาทีต้องอยู่ระหว่าง 0–59';
    else error = 'เวลานี้เร็วเกินจริง ลองตรวจสอบอีกครั้ง';
  }

  return (
    <Dialog open={open} title="บันทึกการวิ่ง" onClose={close} className="log-dialog">
      <form className="log-form" onSubmit={submit} noValidate>
        <fieldset className="log-field">
          <legend>ระยะทาง</legend>
          <PillGroup options={DISTANCE_OPTIONS} value={distance} onSelect={setDistance} className="log-pills" />
          {distance === 'custom' && (
            <div className="log-input-unit">
              <input className="form-control" type="number" inputMode="decimal" min="0.5" step="0.1" aria-label="ระยะทาง (กม.)" placeholder="เช่น 7.5" value={customDistance} onChange={e => setCustomDistance(e.target.value)} />
              <span>กม.</span>
            </div>
          )}
        </fieldset>

        <fieldset className="log-field">
          <legend>เวลาที่ใช้</legend>
          <div className="log-time">
            <div className="log-input-unit">
              <input className="form-control log-time-input" type="number" inputMode="numeric" min="0" aria-label="นาที" placeholder="00" value={minutes} onChange={e => setMinutes(e.target.value)} autoFocus />
              <span>นาที</span>
            </div>
            <span className="log-time-sep" aria-hidden="true">:</span>
            <div className="log-input-unit">
              <input className="form-control log-time-input" type="number" inputMode="numeric" min="0" max="59" aria-label="วินาที" placeholder="00" value={seconds} onChange={e => setSeconds(e.target.value)} />
              <span>วินาที</span>
            </div>
          </div>
        </fieldset>

        <fieldset className="log-field">
          <legend>วันที่</legend>
          <PillGroup options={DATE_OPTIONS} value={dateChoice} onSelect={setDateChoice} className="log-pills" />
          {dateChoice === 'custom' && (
            <input className="form-control" type="date" aria-label="วันที่วิ่ง" max={daysAgo(0)} value={customDate} onChange={e => setCustomDate(e.target.value)} />
          )}
        </fieldset>

        <div className="log-preview" aria-live="polite">
          {preview ? (
            <>
              <span>Pace <b>{formatPace(effort)}</b> /กม.</span>
              <span className="level-chip" data-level={preview.level.id}>{preview.level.label}</span>
            </>
          ) : <span>กรอกเวลา แล้วเราจะคำนวณเลเวลให้ทันที</span>}
        </div>

        {error && <p className="log-error" role="alert">{error}</p>}

        <div className="form-actions">
          <Button variant="secondary" onClick={close}>ยกเลิก</Button>
          <Button type="submit">บันทึก</Button>
        </div>
      </form>
    </Dialog>
  );
}
