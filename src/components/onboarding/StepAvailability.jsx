import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import step4Img from '../../assets/onboarding/step4.png';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  yourRhythm: step4Img
};

const AREA_OPTIONS = [
  { value: 'park', label: 'สวนสาธารณะ' },
  { value: 'gym', label: 'ยิม' },
  { value: 'running_track', label: 'ลู่วิ่ง' },
  { value: 'outdoor', label: 'กลางแจ้ง' },
  { value: 'indoor', label: 'ในร่ม' },
  { value: 'anywhere', label: 'ที่ไหนก็ได้' }
];

const DAY_PRESETS = [
  { value: 'weekdays', label: 'วันธรรมดา' },
  { value: 'weekends', label: 'เสาร์–อาทิตย์' },
  { value: 'custom', label: 'เลือกวันเอง' },
  { value: 'flexible', label: 'ตารางไม่แน่นอน' }
];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'จ.' },
  { value: 'tuesday', label: 'อ.' },
  { value: 'wednesday', label: 'พ.' },
  { value: 'thursday', label: 'พฤ.' },
  { value: 'friday', label: 'ศ.' },
  { value: 'saturday', label: 'ส.' },
  { value: 'sunday', label: 'อา.' }
];

const TIME_PRESETS = [
  { value: 'early_morning', label: 'เช้าตรู่', display: '05:00–08:00' },
  { value: 'morning', label: 'ช่วงเช้า', display: '08:00–11:00' },
  { value: 'midday', label: 'กลางวัน', display: '11:00–14:00' },
  { value: 'after_work', label: 'หลังเลิกงาน', display: '17:00–20:00' },
  { value: 'evening', label: 'ช่วงค่ำ', display: '20:00–22:00' },
  { value: 'anytime', label: 'เวลาไหนก็ได้', display: 'ไม่จำกัด' }
];

const AVAILABILITY_TIME_MAPPING = {
  early_morning: { available_from: "05:00", available_to: "08:00" },
  morning: { available_from: "08:00", available_to: "11:00" },
  midday: { available_from: "11:00", available_to: "14:00" },
  after_work: { available_from: "17:00", available_to: "20:00" },
  evening: { available_from: "20:00", available_to: "22:00" }
};

export default function StepAvailability({ onNext, onPrev }) {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showNote, setShowNote] = useState({}); // { [index]: boolean }

  const windows = formData.availabilityWindows || [];

  const updateWindow = (index, field, value) => {
    const newWindows = [...windows];
    newWindows[index] = { ...newWindows[index], [field]: value };
    updateFormData('availabilityWindows', newWindows);

    // Clear error
    if (errors[index] && errors[index][field]) {
      const newErrors = { ...errors };
      newErrors[index] = { ...newErrors[index] };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const handleAreaTypeSelect = (index, type) => {
    let current = [...windows[index].areaTypes];
    if (type === 'anywhere') {
      current = ['anywhere'];
    } else {
      current = current.filter(t => t !== 'anywhere');
      if (current.includes(type)) {
        current = current.filter(t => t !== type);
      } else {
        current.push(type);
      }
    }
    updateWindow(index, 'areaTypes', current);

    // clear error
    if (errors[index]?.areaTypes) {
      const newErrors = { ...errors };
      newErrors[index] = { ...newErrors[index] };
      delete newErrors[index].areaTypes;
      setErrors(newErrors);
    }
  };

  const handleDaySelect = (index, day) => {
    let current = [...windows[index].selectedDays];
    if (current.includes(day)) {
      current = current.filter(d => d !== day);
    } else {
      current.push(day);
    }
    updateWindow(index, 'selectedDays', current);

    // clear error
    if (errors[index]?.days) {
      const newErrors = { ...errors };
      newErrors[index] = { ...newErrors[index] };
      delete newErrors[index].days;
      setErrors(newErrors);
    }
  };

  const handleTimeSelect = (index, time) => {
    let current = [...windows[index].timePresets];
    if (time === 'anytime') {
      current = ['anytime'];
    } else {
      current = current.filter(t => t !== 'anytime');
      if (current.includes(time)) {
        current = current.filter(t => t !== time);
      } else {
        current.push(time);
      }
    }
    updateWindow(index, 'timePresets', current);

    // clear error
    if (errors[index]?.times) {
      const newErrors = { ...errors };
      newErrors[index] = { ...newErrors[index] };
      delete newErrors[index].times;
      setErrors(newErrors);
    }
  };

  const addWindow = () => {
    if (windows.length >= 3) return;
    const lastWindow = windows[windows.length - 1];
    updateFormData('availabilityWindows', [
      ...windows,
      {
        id: Date.now().toString(),
        areaLabel: lastWindow.areaLabel,
        areaTypes: [...lastWindow.areaTypes],
        dayPreset: '',
        selectedDays: [],
        weeklyFrequency: '',
        timePresets: [],
        customTimeFrom: '',
        customTimeTo: '',
        note: ''
      }
    ]);
  };

  const removeWindow = (index) => {
    if (windows.length <= 1) return;
    const newWindows = windows.filter((_, i) => i !== index);
    updateFormData('availabilityWindows', newWindows);

    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {};

    windows.forEach((win, idx) => {
      const winErrors = {};

      if (win.areaTypes.length === 0) {
        winErrors.areaTypes = 'เลือกประเภทพื้นที่ที่คุณสะดวก';
      }

      if (!win.dayPreset) {
        winErrors.days = 'เลือกวันที่มักสะดวก';
      } else if (win.dayPreset === 'custom' && win.selectedDays.length === 0) {
        winErrors.days = 'เลือกวันที่มักสะดวก';
      }

      if (win.dayPreset === 'weekdays' || win.dayPreset === 'weekends') {
        if (!win.weeklyFrequency) {
          winErrors.frequency = 'เลือกจำนวนวันที่อยากซ้อมต่อสัปดาห์';
        }
      }

      if (win.timePresets.length === 0) {
        winErrors.times = 'เลือกช่วงเวลาที่มักสะดวก';
      } else if (win.timePresets.includes('custom')) {
        if (!win.customTimeFrom) winErrors.customTimeFrom = 'ระบุเวลาเริ่มต้น';
        if (!win.customTimeTo) winErrors.customTimeTo = 'ระบุเวลาสิ้นสุด';
        if (win.customTimeFrom && win.customTimeTo) {
          if (win.customTimeFrom >= win.customTimeTo) {
            winErrors.customTimeOrder = 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น';
          } else {
            const d1 = new Date(`1970-01-01T${win.customTimeFrom}:00`);
            const d2 = new Date(`1970-01-01T${win.customTimeTo}:00`);
            if ((d2 - d1) < 30 * 60 * 1000) {
              winErrors.customTimeOrder = 'เลือกช่วงเวลาอย่างน้อย 30 นาที';
            }
          }
        }
      }

      if (Object.keys(winErrors).length > 0) {
        newErrors[idx] = winErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const mapToConstraints = () => {
    const finalConstraints = [];

    windows.forEach(win => {
      const daysToMap = [];
      if (win.dayPreset === 'flexible') {
        daysToMap.push(null);
      } else if (win.dayPreset === 'weekdays') {
        daysToMap.push('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
      } else if (win.dayPreset === 'weekends') {
        daysToMap.push('saturday', 'sunday');
      } else if (win.dayPreset === 'custom') {
        daysToMap.push(...win.selectedDays);
      }

      let frequency = 1;
      if (win.dayPreset === 'flexible') frequency = parseInt(win.weeklyFrequency, 10) || 1;
      else if (win.dayPreset === 'custom') frequency = win.selectedDays.length;
      else frequency = parseInt(win.weeklyFrequency, 10) || daysToMap.length;

      const areaTypesToMap = win.areaTypes.length > 0 ? win.areaTypes : ['anywhere'];
      const noteToMap = win.dayPreset === 'flexible' ? (win.note ? `flexible_schedule: ${win.note}` : 'flexible_schedule') : win.note;

      win.timePresets.forEach(timeType => {
        let from = '';
        let to = '';

        if (timeType === 'custom') {
          from = win.customTimeFrom;
          to = win.customTimeTo;
        } else if (timeType !== 'anytime' && AVAILABILITY_TIME_MAPPING[timeType]) {
          from = AVAILABILITY_TIME_MAPPING[timeType].available_from;
          to = AVAILABILITY_TIME_MAPPING[timeType].available_to;
        }

        daysToMap.forEach(day => {
          areaTypesToMap.forEach(areaT => {
            finalConstraints.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              constraintType: 'training_availability',
              areaType: areaT,
              areaLabel: win.areaLabel || null,
              dayOfWeek: day,
              availableFrom: from || null,
              availableTo: to || null,
              weeklyFrequency: frequency,
              note: noteToMap || null,
              isActive: true
            });
          });
        });
      });
    });

    return finalConstraints;
  };

  const handleNext = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const constraints = mapToConstraints();
      updateFormData('constraints', constraints);

      // Simulate API call
      await new Promise(r => setTimeout(r, 800));
      onNext();
    } catch (err) {
      setSubmitError('บันทึกช่วงเวลายังไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPillButton = (label, isSelected, onClick, hasCheck = false) => (
    <button
      type="button"
      className={`onboarding-pill-button ${isSelected ? 'selected' : ''}`}
      style={{ flex: '0 0 auto' }}
      onClick={onClick}
    >
      {hasCheck && isSelected && (
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          backgroundColor: 'var(--color-brand-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white'
        }}>
          <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {label}
    </button>
  );

  const renderDayChip = (day, isSelected, onClick) => (
    <button
      type="button"
      className={`onboarding-pill-button ${isSelected ? 'selected' : ''}`}
      style={{
        width: '40px',
        height: '40px',
        minWidth: '40px',
        padding: '0',
        borderRadius: '50%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto'
      }}
      onClick={onClick}
    >
      {isSelected && (
        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--color-brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <svg width="8" height="6" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {day.label}
    </button>
  );

  const getPreviewText = () => {
    if (windows.length === 0) return null;

    // We only preview the first window for simplicity, or combine them
    const w = windows[0];

    let areaText = '';
    if (w.areaLabel) areaText += w.areaLabel + ' · ';
    if (w.areaTypes.includes('anywhere')) areaText += 'ที่ไหนก็ได้';
    else areaText += w.areaTypes.map(t => AREA_OPTIONS.find(o => o.value === t)?.label).join(', ');

    let daysText = '';
    let freqText = '';
    if (w.dayPreset === 'flexible') {
      daysText = 'ตารางยืดหยุ่น';
      if (w.weeklyFrequency) freqText = `ประมาณ ${w.weeklyFrequency} วันต่อสัปดาห์`;
    } else if (w.dayPreset === 'weekdays') {
      daysText = 'วันธรรมดา (จ.-ศ.)';
      if (w.weeklyFrequency) freqText = `ประมาณ ${w.weeklyFrequency} วันต่อสัปดาห์`;
    } else if (w.dayPreset === 'weekends') {
      daysText = 'เสาร์-อาทิตย์';
      if (w.weeklyFrequency) freqText = `ประมาณ ${w.weeklyFrequency} วันต่อสัปดาห์`;
    } else if (w.dayPreset === 'custom') {
      const selectedLabels = DAYS_OF_WEEK.filter(d => w.selectedDays.includes(d.value)).map(d => d.label);
      daysText = selectedLabels.join(' ');
      freqText = `ประมาณ ${selectedLabels.length} วันต่อสัปดาห์`;
    }

    let timeText = '';
    if (w.timePresets.includes('anytime')) {
      timeText = 'เวลาไหนก็ได้';
    } else {
      const parts = w.timePresets.map(t => {
        if (t === 'custom') return `${w.customTimeFrom}-${w.customTimeTo}`;
        const preset = TIME_PRESETS.find(p => p.value === t);
        return preset ? `${preset.label} · ${preset.display}` : '';
      });
      timeText = parts.filter(Boolean).join(' หรือ ');
    }

    return (
      <div className="onboarding-feedback-card onboarding-fade-in" style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-brand-600)', marginBottom: '12px' }}>
          <span style={{ fontSize: '16px', marginRight: '6px' }}>✨</span>จังหวะที่เหมาะกับคุณ
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {areaText && <div style={{ fontSize: '14px', color: 'var(--color-neutral-800)' }}><strong style={{ color: 'var(--color-brand-500)', marginRight: '8px' }}>📍</strong> {areaText}</div>}
          {daysText && <div style={{ fontSize: '14px', color: 'var(--color-neutral-800)' }}><strong style={{ color: 'var(--color-brand-500)', marginRight: '8px' }}>🗓️</strong> {daysText}</div>}
          {timeText && <div style={{ fontSize: '14px', color: 'var(--color-neutral-800)' }}><strong style={{ color: 'var(--color-brand-500)', marginRight: '8px' }}>🕒</strong> {timeText}</div>}
        </div>
        {freqText && <div style={{ fontSize: '14px', color: 'var(--color-neutral-500)', marginTop: '12px', borderTop: '1px solid var(--color-neutral-200)', paddingTop: '12px' }}>{freqText}</div>}
      </div>
    );
  };

  return (
    <>
      <div className="onboarding-modal-body">
        {/* Header Section */}
        <div className="onboarding-fullwidth-header">
          <img
            src={ONBOARDING_STEP_ILLUSTRATIONS.yourRhythm}
            alt="Lowrox training availability illustration"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="onboarding-text-align">
            <h2 className="heading-2" style={{ marginBottom: '8px' }}>จังหวะไหนเข้ากับชีวิตคุณ? 🗓️</h2>
            <p className="body-md" style={{ color: 'var(--color-neutral-600)' }}>
              เลือกช่วงที่มักสะดวก เราจะช่วยหา Buddy และ Training Party ที่เข้ากับคุณ
            </p>
          </div>
        </div>

        {submitError && (
          <div className="error-message-area" role="alert" style={{ marginBottom: '24px' }}>
            {submitError}
          </div>
        )}

        <div className="onboarding-form-section">
          {windows.map((win, index) => (
            <div key={win.id} style={{ position: 'relative', borderBottom: index < windows.length - 1 ? '1px dashed var(--color-neutral-300)' : 'none', paddingBottom: index < windows.length - 1 ? '32px' : '0', marginBottom: index < windows.length - 1 ? '32px' : '0' }}>

              {windows.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-brand-600)' }}>ช่วงเวลาที่ {index + 1}</h3>
                  <button onClick={() => removeWindow(index)} style={{ background: 'none', border: 'none', color: 'var(--color-error-500)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>
                    ลบ
                  </button>
                </div>
              )}

              {/* Area Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '12px' }}>ปกติคุณสะดวกซ้อมแถวไหน? 📍</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>📌</span>
                  <input
                    type="text"
                    value={win.areaLabel}
                    onChange={(e) => updateWindow(index, 'areaLabel', e.target.value)}
                    placeholder="ค้นหาเขต ย่าน หรือสถานที่ใกล้คุณ"
                    style={{ width: '100%', padding: '12px 16px 12px 48px', backgroundColor: '#fff' }}
                  />
                </div>
                <div className="onboarding-helper-text" style={{ marginTop: '8px' }}>
                  ใส่ชื่อย่านเช่น สวนลุมพินี, อารีย์, บางนา หรือเว้นว่างหากยังไม่กำหนด
                </div>
              </div>

              {/* Area Type */}
              <div className="onboarding-form-section">
                <label className="onboarding-label">คุณโอเคกับพื้นที่แบบไหนบ้าง?</label>
                <div className="onboarding-pill-container" style={{ gap: '10px' }}>
                  {AREA_OPTIONS.map(opt => renderPillButton(opt.label, win.areaTypes.includes(opt.value), () => handleAreaTypeSelect(index, opt.value), true))}
                </div>
                {errors[index]?.areaTypes && <div className="validation-message onboarding-error-text" role="alert">{errors[index].areaTypes}</div>}
              </div>

              {/* Day Selection */}
              <div className="onboarding-form-section">
                <label className="onboarding-label">วันไหนที่คุณมักสะดวกซ้อม?</label>
                <div className="onboarding-pill-container" style={{ gap: '10px', marginBottom: '16px' }}>
                  {DAY_PRESETS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`choice-card ${win.dayPreset === opt.value ? 'choice-card-selected' : ''}`}
                      style={{ padding: '10px 16px', flex: '0 0 auto', minHeight: '44px' }}
                      onClick={() => {
                        updateWindow(index, 'dayPreset', opt.value);
                        if (errors[index]?.days) {
                          const ne = { ...errors }; ne[index] = { ...ne[index] }; delete ne[index].days; setErrors(ne);
                        }
                      }}
                    >
                      <div className="choice-card-label" style={{ fontSize: '14px' }}>{opt.label}</div>
                    </button>
                  ))}
                </div>
                {errors[index]?.days && <div className="validation-message onboarding-error-text" role="alert">{errors[index].days}</div>}

                {win.dayPreset === 'custom' && (
                  <div className="onboarding-fade-in" style={{ marginBottom: '16px' }}>
                    <div className="onboarding-pill-container" style={{ gap: '12px' }}>
                      {DAYS_OF_WEEK.map(day => renderDayChip(day, win.selectedDays.includes(day.value), () => handleDaySelect(index, day.value)))}
                    </div>
                  </div>
                )}

                {(win.dayPreset === 'weekdays' || win.dayPreset === 'weekends' || win.dayPreset === 'flexible') && (
                  <div className="onboarding-fade-in" style={{ marginTop: '16px', backgroundColor: 'var(--color-neutral-50)', padding: '16px', borderRadius: '12px' }}>
                    <label className="onboarding-label" style={{ fontSize: '14px', marginBottom: '12px' }}>อยากซ้อมประมาณกี่วันต่อสัปดาห์?</label>
                    <div className="onboarding-pill-container" style={{ gap: '8px' }}>
                      {['1', '2', '3', '4', '5', '6', '7'].slice(0, win.dayPreset === 'weekends' ? 2 : (win.dayPreset === 'weekdays' ? 5 : 7)).map(num => renderPillButton(`${num} วัน`, win.weeklyFrequency === String(num), () => {
                        updateWindow(index, 'weeklyFrequency', String(num));
                        if (errors[index]?.frequency) {
                          const ne = { ...errors }; ne[index] = { ...ne[index] }; delete ne[index].frequency; setErrors(ne);
                        }
                      }))}
                    </div>
                    {errors[index]?.frequency && <div className="validation-message onboarding-error-text" role="alert">{errors[index].frequency}</div>}
                    <div className="onboarding-helper-text" style={{ marginTop: '8px' }}>(ระบบจะช่วยกระจายวันซ้อมให้เหมาะสม)</div>
                  </div>
                )}

                {win.dayPreset === 'custom' && win.selectedDays.length > 0 && (
                  <div className="onboarding-helper-text" style={{ marginTop: '8px' }}>
                    คุณมีเวลาซ้อมประมาณ {win.selectedDays.length} วันต่อสัปดาห์
                  </div>
                )}
              </div>

              {/* Time Selection */}
              <div className="onboarding-form-section">
                <label className="onboarding-label">ช่วงไหนที่มักสะดวก?</label>
                <div className="onboarding-pill-container" style={{ gap: '10px', marginBottom: '16px' }}>
                  {TIME_PRESETS.map(opt => renderPillButton(opt.label, win.timePresets.includes(opt.value), () => handleTimeSelect(index, opt.value), true))}
                  {renderPillButton('กำหนดเวลาเอง', win.timePresets.includes('custom'), () => handleTimeSelect(index, 'custom'), true)}
                </div>
                {errors[index]?.times && <div className="validation-message onboarding-error-text" role="alert">{errors[index].times}</div>}

                {win.timePresets.includes('custom') && (
                  <div className="onboarding-fade-in" style={{ backgroundColor: 'var(--color-brand-50)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '4px' }}>ตั้งแต่เวลา</label>
                        <input type="time" value={win.customTimeFrom} onChange={(e) => updateWindow(index, 'customTimeFrom', e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-neutral-300)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '4px' }}>ถึงเวลา</label>
                        <input type="time" value={win.customTimeTo} onChange={(e) => updateWindow(index, 'customTimeTo', e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-neutral-300)' }} />
                      </div>
                    </div>
                    {errors[index]?.customTimeFrom && <div className="validation-message onboarding-error-text" role="alert">{errors[index].customTimeFrom}</div>}
                    {errors[index]?.customTimeTo && <div className="validation-message onboarding-error-text" role="alert">{errors[index].customTimeTo}</div>}
                    {errors[index]?.customTimeOrder && <div className="validation-message onboarding-error-text" role="alert">{errors[index].customTimeOrder}</div>}
                    <div className="onboarding-helper-text" style={{ marginTop: '8px' }}>หากเวลาข้ามเที่ยงคืน คุณสามารถเพิ่มภายหลังได้ใน Profile</div>
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="onboarding-form-section" style={{ marginBottom: '16px' }}>
                {!showNote[index] ? (
                  <button type="button" onClick={() => setShowNote({ ...showNote, [index]: true })} style={{ background: 'none', border: 'none', color: 'var(--color-brand-600)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
                    มีข้อจำกัดเรื่องเวลาเพิ่มเติมไหม?
                  </button>
                ) : (
                  <div className="onboarding-fade-in">
                    <label className="onboarding-label">ข้อจำกัดเรื่องเวลา (Optional)</label>
                    <textarea
                      value={win.note}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) updateWindow(index, 'note', e.target.value);
                      }}
                      placeholder="เช่น สะดวกเฉพาะหลังเลิกงาน หรือเวลาอาจเปลี่ยนในแต่ละสัปดาห์"
                      rows="3"
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--color-neutral-300)', borderRadius: '12px' }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '12px', color: win.note.length > 400 ? 'var(--color-error-500)' : 'var(--color-neutral-500)', marginTop: '4px' }}>
                      {win.note.length}/500
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}

          {windows.length < 3 && (
            <button
              type="button"
              onClick={addWindow}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                border: '1px dashed var(--color-brand-400)',
                backgroundColor: 'var(--color-brand-50)',
                color: 'var(--color-brand-600)', fontWeight: 600,
                cursor: 'pointer', fontSize: '14px'
              }}
            >
              + เพิ่มอีกช่วงเวลา
            </button>
          )}

          {getPreviewText()}
        </div>
      </div>

      <div className="onboarding-modal-footer">
          <button
            className="btn btn-secondary btn-md"
            onClick={onPrev}
            style={{ width: 'auto', marginRight: '16px' }}
          >
            ← ย้อนกลับ
          </button>
          <button
            className="btn btn-primary btn-md btn-cta w-full"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'ได้จังหวะที่ลงตัวแล้ว →'}
          </button>
        </div>
      </>
      );
}
