import type { StepHandle, StepProps, AvailabilityWindow, OnboardingData } from '../../types/models';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import step4Img from '../../assets/onboarding/step4.jpg';
import FormSection from '../common/FormSection';
import FeedbackCard from '../common/FeedbackCard';
import PillGroup from '../common/PillGroup';
import OnboardingStepLayout from './OnboardingStepLayout';
import { useStepSubmit } from '../../hooks/useStepSubmit';
import { MapPin, Calendar as CalendarIcon, Clock, Sparkles, Check, Plus } from 'lucide-react';

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
  { value: 'weekends', label: 'เสาร์ - อาทิตย์' },
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

const WEEKLY_FREQUENCY_OPTIONS = ['1', '2', '3', '4', '5', '6', '7'].map(num => ({ value: num, label: `${num} วัน` }));

const TIME_PRESETS = [
  { value: 'early_morning', label: 'เช้าตรู่', display: '05:00 - 08:00' },
  { value: 'morning', label: 'ช่วงเช้า', display: '08:00 - 11:00' },
  { value: 'midday', label: 'กลางวัน', display: '11:00 - 14:00' },
  { value: 'after_work', label: 'หลังเลิกงาน', display: '17:00 - 20:00' },
  { value: 'evening', label: 'ช่วงค่ำ', display: '20:00 - 22:00' },
  { value: 'anytime', label: 'เวลาไหนก็ได้', display: 'ไม่จำกัด' }
];

const TIME_OPTIONS_WITH_CUSTOM = [...TIME_PRESETS, { value: 'custom', label: 'กำหนดเวลาเอง' }];

const AVAILABILITY_TIME_MAPPING: Record<string, { available_from: string; available_to: string }> = {
  early_morning: { available_from: "05:00", available_to: "08:00" },
  morning: { available_from: "08:00", available_to: "11:00" },
  midday: { available_from: "11:00", available_to: "14:00" },
  after_work: { available_from: "17:00", available_to: "20:00" },
  evening: { available_from: "20:00", available_to: "22:00" }
};

const StepAvailability = forwardRef<StepHandle, StepProps>(({ onNext, onPrev, isEditor, externalShowValidation }, ref) => {
  const { formData, updateFormData } = useOnboarding();
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const { isSubmitting, submitError, submit } = useStepSubmit('บันทึกช่วงเวลายังไม่สำเร็จ กรุณาลองอีกครั้ง', 800);
  const [internalShowValidation, setShowValidation] = useState(false);
  const showValidation = internalShowValidation || externalShowValidation;

  useImperativeHandle(ref, () => ({
    validate
  }));
  const [showNote, setShowNote] = useState<Record<number, boolean>>({}); // { [index]: boolean }

  const windows = formData.availabilityWindows || [];

  const clearError = (index: number, field: string) => {
    setErrors(prev => {
      if (!prev[index]?.[field]) return prev;
      const windowErrors = { ...prev[index] };
      delete windowErrors[field];
      return { ...prev, [index]: windowErrors };
    });
  };

  const updateWindow = <K extends keyof AvailabilityWindow,>(index: number, field: K, value: AvailabilityWindow[K]) => {
    const newWindows = [...windows];
    newWindows[index] = { ...newWindows[index], [field]: value };
    updateFormData('availabilityWindows', newWindows);
    clearError(index, field);
  };

  const handleAreaTypeSelect = (index: number, type: string) => {
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
    clearError(index, 'areaTypes');
  };

  const handleDaySelect = (index: number, day: string) => {
    let current = [...windows[index].selectedDays];
    if (current.includes(day)) {
      current = current.filter(d => d !== day);
    } else {
      current.push(day);
    }
    updateWindow(index, 'selectedDays', current);
    clearError(index, 'days');
  };

  const handleTimeSelect = (index: number, time: string) => {
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
    clearError(index, 'times');
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

  const removeWindow = (index: number) => {
    if (windows.length <= 1) return;
    const newWindows = windows.filter((_, i) => i !== index);
    updateFormData('availabilityWindows', newWindows);

    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const validate = () => {
    let isValid = true;
    const newErrors: Record<number, Record<string, string>> = {};

    windows.forEach((win, idx) => {
      const winErrors: Record<string, string> = {};

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
            if ((d2.getTime() - d1.getTime()) < 30 * 60 * 1000) {
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
    const finalConstraints: NonNullable<OnboardingData['constraints']> = [];

    windows.forEach(win => {
      const daysToMap: (string | null)[] = [];
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
    setShowValidation(true);
    if (!validate()) return;
    updateFormData('constraints', mapToConstraints());
    await submit(onNext);
  };




  const renderDayChip = (day: { value: string; label: string }, isSelected: boolean, onClick: () => void) => (
    <button
      type="button"
      className={`onboarding-pill-button ${isSelected ? 'selected' : ''} w-10 h-10 min-w-10 p-0 rounded-full relative flex items-center justify-center flex-none`}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white">
          <Check size={10} strokeWidth={3} />
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
      <FeedbackCard className="mt-6">
        <h4 className="text-[13px] font-bold text-brand-600 mb-3">
          <span className="mr-2 text-brand-500"><Sparkles size={16} /></span>จังหวะที่เหมาะกับคุณ
        </h4>
        <div className="flex flex-col gap-2">
          {areaText && <div className="text-sm text-neutral-800 flex items-center"><MapPin size={16} className="text-brand-500 mr-2" /> {areaText}</div>}
          {daysText && <div className="text-sm text-neutral-800 flex items-center mt-1"><CalendarIcon size={16} className="text-brand-500 mr-2" /> {daysText}</div>}
          {timeText && <div className="text-sm text-neutral-800 flex items-center mt-1"><Clock size={16} className="text-brand-500 mr-2" /> {timeText}</div>}
        </div>
        {freqText && <div className="text-sm text-neutral-500 mt-3 border-t border-neutral-200 pt-3">{freqText}</div>}
      </FeedbackCard>
    );
  };


  const formContent = (
    <>
        {submitError && (
          <div className="error-message-area mb-6" role="alert">
            {submitError}
          </div>
        )}

        <div className="onboarding-form-section">
          {windows.map((win, index) => (
            <div
              key={win.id}
              className={`relative ${index < windows.length - 1 ? 'border-b border-dashed border-neutral-300 pb-8 mb-8' : ''}`}
            >

              {windows.length > 1 && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-brand-600">ช่วงเวลาที่ {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeWindow(index)}
                    className="bg-transparent border-none text-error text-sm cursor-pointer underline"
                  >
                    ลบ
                  </button>
                </div>
              )}

              {/* Area Input */}
              <div className="mb-6">
                <label className="flex items-center font-semibold mb-3">ปกติคุณสะดวกซ้อมแถวไหน? <MapPin size={20} className="ml-2" /></label>
                <div className="relative onboarding-area-input">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"><MapPin size={18} /></span>
                  <input
                    type="text"
                    value={win.areaLabel}
                    onChange={(e) => updateWindow(index, 'areaLabel', e.target.value)}
                    className={`w-full py-3 pr-4 pl-12 bg-white ${showValidation && !win.area ? 'input-error' : ''}`}
                  />
                </div>
                <div className="onboarding-helper-text mt-2">
                  ใส่ชื่อย่านเช่น สวนลุมพินี, อารีย์, บางนา หรือเว้นว่างหากยังไม่กำหนด
                </div>
              </div>

              {/* Area Type */}
              <FormSection
                label="คุณโอเคกับพื้นที่แบบไหนบ้าง?"
                error={errors[index]?.areaTypes}
              >
                <PillGroup
                  options={AREA_OPTIONS}
                  value={win.areaTypes}
                  onSelect={(value) => handleAreaTypeSelect(index, value)}
                  className="gap-2"
                  pillClassName="flex-none"
                />
              </FormSection>

              {/* Day Selection */}
              <FormSection
                label="วันไหนที่คุณมักสะดวกซ้อม?"
                error={errors[index]?.days}
              >
                <div className="onboarding-pill-container gap-2 mb-4">
                  {DAY_PRESETS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`onboarding-pill-button px-4 py-2 flex-none min-h-11 ${win.dayPreset === opt.value ? 'selected' : ''}`}
                      onClick={() => {
                        updateWindow(index, 'dayPreset', opt.value);
                        clearError(index, 'days');
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {win.dayPreset === 'custom' && (
                  <div className="onboarding-fade-in mb-4">
                    <div className="onboarding-pill-container gap-3">
                      {DAYS_OF_WEEK.map(day => renderDayChip(day, win.selectedDays.includes(day.value), () => handleDaySelect(index, day.value)))}
                    </div>
                  </div>
                )}

                {(win.dayPreset === 'weekdays' || win.dayPreset === 'weekends' || win.dayPreset === 'flexible') && (
                  <div className="onboarding-fade-in mt-4 bg-neutral-50 p-4 rounded-xl">
                    <label className="onboarding-label text-sm mb-3">อยากซ้อมประมาณกี่วันต่อสัปดาห์?</label>
                    <PillGroup
                      options={WEEKLY_FREQUENCY_OPTIONS.slice(0, win.dayPreset === 'weekends' ? 2 : (win.dayPreset === 'weekdays' ? 5 : 7))}
                      value={win.weeklyFrequency}
                      onSelect={(value) => {
                        updateWindow(index, 'weeklyFrequency', value);
                        clearError(index, 'frequency');
                      }}
                      className="gap-2"
                      pillClassName="flex-none"
                    />
                    {errors[index]?.frequency && <div className="validation-message onboarding-error-text" role="alert">{errors[index].frequency}</div>}
                    <div className="onboarding-helper-text mt-2">(ระบบจะช่วยกระจายวันซ้อมให้เหมาะสม)</div>
                  </div>
                )}

                {win.dayPreset === 'custom' && win.selectedDays.length > 0 && (
                  <div className="onboarding-helper-text mt-2">
                    คุณมีเวลาซ้อมประมาณ {win.selectedDays.length} วันต่อสัปดาห์
                  </div>
                )}
              </FormSection>

              {/* Time Selection */}
              <FormSection
                label="ช่วงไหนที่มักสะดวก?"
                error={errors[index]?.times}
              >
                <PillGroup
                  options={TIME_OPTIONS_WITH_CUSTOM}
                  value={win.timePresets}
                  onSelect={(value) => handleTimeSelect(index, value)}
                  className="gap-2 mb-4"
                  pillClassName="flex-none"
                />

                {win.timePresets.includes('custom') && (
                  <div className="onboarding-fade-in bg-brand-50 p-4 rounded-xl">
                    <div className="flex gap-4 items-center">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">ตั้งแต่เวลา</label>
                        <input type="time" value={win.customTimeFrom} onChange={(e) => updateWindow(index, 'customTimeFrom', e.target.value)} className="px-4 py-2 rounded-sm border border-neutral-300" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">ถึงเวลา</label>
                        <input type="time" value={win.customTimeTo} onChange={(e) => updateWindow(index, 'customTimeTo', e.target.value)} className="px-4 py-2 rounded-sm border border-neutral-300" />
                      </div>
                    </div>
                    {errors[index]?.customTimeFrom && <div className="validation-message onboarding-error-text" role="alert">{errors[index].customTimeFrom}</div>}
                    {errors[index]?.customTimeTo && <div className="validation-message onboarding-error-text" role="alert">{errors[index].customTimeTo}</div>}
                    {errors[index]?.customTimeOrder && <div className="validation-message onboarding-error-text" role="alert">{errors[index].customTimeOrder}</div>}
                    <div className="onboarding-helper-text mt-2">หากเวลาข้ามเที่ยงคืน คุณสามารถเพิ่มภายหลังได้ใน Profile</div>
                  </div>
                )}
              </FormSection>

              {/* Note */}
              <div className="onboarding-form-section mb-4">
                {!showNote[index] ? (
                  <button type="button" onClick={() => setShowNote({ ...showNote, [index]: true })} className="bg-transparent border-none text-brand-600 font-semibold cursor-pointer text-sm underline">
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
                      className={`w-full p-3 border rounded-xl ${win.note.length > 400 ? 'border-error' : 'border-neutral-300'}`}
                    />
                    <div className={`text-right text-xs mt-1 ${win.note.length > 400 ? 'text-error' : 'text-neutral-500'}`}>
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
              className="btn btn-secondary w-full border-dashed flex items-center justify-center gap-2 mt-2"
              onClick={addWindow}
            >
              <Plus size={16} /> เพิ่มอีกช่วงเวลา
            </button>
          )}

          {getPreviewText()}
        </div>
    </>
  );

  return (
    <OnboardingStepLayout
      isEditor={isEditor}
      illustration={step4Img}
      illustrationAlt="Lowrox training availability illustration"
      title={<>จังหวะไหนเข้ากับชีวิตคุณ? <CalendarIcon size={28} className="ml-2" /></>}
      description="เลือกช่วงที่มักสะดวก เราจะช่วยหา Buddy และ Training Party ที่เข้ากับคุณ"
      onPrev={onPrev}
      onNext={handleNext}
      nextLabel={isSubmitting ? 'กำลังบันทึก...' : 'ได้จังหวะที่ลงตัวแล้ว →'}
      nextDisabled={isSubmitting}
    >
      {formContent}
    </OnboardingStepLayout>
  );
});

export default StepAvailability;
