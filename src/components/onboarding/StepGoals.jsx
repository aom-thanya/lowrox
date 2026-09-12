import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import step3Img from '../../assets/onboarding/step3.png';
import ChoiceCard from '../common/ChoiceCard';
import PillButton from '../common/PillButton';
import FormSection from '../common/FormSection';
import InputWrapper from '../common/InputWrapper';
import FeedbackCard from '../common/FeedbackCard';
import { calculateTargetDateString } from '../../utils/onboardingUtils';
import { Footprints, Timer, Medal, Users, Dumbbell, Lightbulb } from 'lucide-react';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  nextChallenge: step3Img,
};

const GOAL_TYPES = [
  { value: 'increase_distance', label: 'วิ่งให้ไกลขึ้น', desc: 'เพิ่มระยะทางจากที่ทำได้ตอนนี้', icon: <Footprints /> },
  { value: 'improve_time', label: 'วิ่งให้เร็วขึ้น', desc: 'ทำเวลาให้ดีขึ้นในระยะเดิม', icon: <Timer /> },
  { value: 'prepare_event', label: 'เตรียมลงแข่ง', desc: 'เตรียมตัวสำหรับสนามจริง', icon: <Medal /> },
  { value: 'buddy_event', label: 'เตรียมแข่งแบบ Buddy', desc: 'เตรียมตัวและหาคู่ร่วมทีม', icon: <Users /> },
  { value: 'improve_endurance', label: 'เพิ่มความแข็งแรงและความอึด', desc: 'พัฒนาความพร้อมโดยรวม', icon: <Dumbbell /> },
  { value: 'recommend_for_me', label: 'ให้ Lowrox ช่วยแนะนำ', desc: 'ยังไม่แน่ใจว่าจะเริ่มจากอะไร', icon: <Lightbulb /> }
];

const TARGET_DATE_OPTIONS = [
  { value: 'plus_1_month', label: 'ภายใน 1 เดือน' },
  { value: 'plus_3_months', label: 'ภายใน 3 เดือน' },
  { value: 'plus_6_months', label: 'ภายใน 6 เดือน' },
  { value: 'custom_date', label: 'เลือกวันที่' },
  { value: 'not_set', label: 'ยังไม่กำหนด' }
];

const ENDURANCE_OPTIONS = [
  { value: 'run_longer', label: 'วิ่งได้นานขึ้น' },
  { value: 'improve_stamina', label: 'เหนื่อยน้อยลง' },
  { value: 'increase_strength', label: 'เพิ่มความแข็งแรง' },
  { value: 'functional_race_readiness', label: 'เตรียมพร้อมสำหรับ Functional Race' },
  { value: 'overall_fitness', label: 'พัฒนาโดยรวม' },
  { value: 'unspecified', label: 'ยังไม่แน่ใจ' }
];

const EVENT_OPTIONS = [
  // Mock System Event selection. In real app, would open a modal with events
  { value: 'system_event', label: 'เลือกจาก Event บน Lowrox (จำลอง: BKK Night Run)' },
  { value: 'custom_event', label: 'ระบุรายการเอง' },
  { value: 'not_sure', label: 'ยังไม่ได้เลือกรายการ' }
];

const BUDDY_OPTIONS = [
  { value: 'already_have_buddy', label: 'มีแล้ว' },
  { value: 'looking_for_buddy', label: 'ยังไม่มี อยากให้ช่วยหา' },
  { value: 'undecided', label: 'ยังไม่แน่ใจ' }
];

const StepGoals = forwardRef(({ onNext, onPrev, isEditor, externalShowValidation }, ref) => {
  const { formData, updateFormData } = useOnboarding();

  // Use goals[0] for the primary challenge
  const goalState = formData.goals[0] || {};

  const [goalType, setGoalType] = useState(goalState.goalType || '');

  // States
  const [distSelect, setDistSelect] = useState(goalState.targetDistanceSelection || '');
  const [customDist, setCustomDist] = useState(goalState.customTargetDistance || '');
  const [durSelect, setDurSelect] = useState(goalState.targetDurationSelection || '');
  const [customHrs, setCustomHrs] = useState(goalState.customTargetDurationHrs || '');
  const [customMins, setCustomMins] = useState(goalState.customTargetDurationMins || '');

  const [eventSelect, setEventSelect] = useState(goalState.eventSelection || '');
  const [customEvent, setCustomEvent] = useState(goalState.customEventName || '');
  const [buddyStatus, setBuddyStatus] = useState(goalState.buddyStatus || '');

  const [enduranceFocus, setEnduranceFocus] = useState(goalState.enduranceFocus || '');

  const [dateSelect, setDateSelect] = useState(goalState.targetDateSelection || '');
  const [customDate, setCustomDate] = useState(goalState.customTargetDate || '');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [internalShowValidation, setShowValidation] = useState(false);
  const showValidation = internalShowValidation || externalShowValidation;

  useImperativeHandle(ref, () => ({
    validate
  }));

  // Sync state back to context
  useEffect(() => {
    // Generate Target Value String
    let targetValue = '';
    let targetDateStr = '';
    let recStatus = '';

    // Calculate Target Date String
    targetDateStr = calculateTargetDateString(dateSelect, customDate, eventSelect);

    if (goalType === 'increase_distance') {
      const finalDist = distSelect === 'custom' ? customDist : distSelect;
      targetValue = finalDist ? `${finalDist} km` : '';
    } else if (goalType === 'improve_time') {
      const finalDist = distSelect === 'custom' ? customDist : distSelect;
      const h = Number(customHrs) || 0;
      const m = Number(customMins) || 0;
      const finalDur = durSelect === 'custom' ? h * 60 + m : durSelect;
      if (finalDist && finalDur) {
        targetValue = `${finalDist} km in ${finalDur} min`;
      }
    } else if (goalType === 'prepare_event' || goalType === 'buddy_event') {
      const evName = eventSelect === 'custom_event' ? customEvent : (eventSelect === 'system_event' ? 'BKK Night Run' : 'unspecified');
      targetValue = evName;
      if (goalType === 'buddy_event' && buddyStatus) {
        targetValue += `; ${buddyStatus}`;
      }
    } else if (goalType === 'improve_endurance') {
      targetValue = enduranceFocus;
    } else if (goalType === 'recommend_for_me') {
      recStatus = 'recommendation_requested';
    }

    const updatedGoal = {
      id: goalState.id || Date.now().toString(),
      goalType,
      targetValue,
      targetDate: targetDateStr,
      targetDistanceSelection: distSelect,
      customTargetDistance: customDist,
      targetDurationSelection: durSelect,
      customTargetDurationHrs: customHrs,
      customTargetDurationMins: customMins,
      eventSelection: eventSelect,
      customEventName: customEvent,
      buddyStatus,
      enduranceFocus,
      targetDateSelection: dateSelect,
      customTargetDate: customDate,
      recommendationStatus: recStatus
    };

    updateFormData('goals', [updatedGoal]);
  }, [goalType, distSelect, customDist, durSelect, customHrs, customMins, eventSelect, customEvent, buddyStatus, enduranceFocus, dateSelect, customDate]);

  // Derived values from Step 2
  const currentDist = Number(formData.fitnessLevel.runningDistance) || 0;
  const currentDur = Number(formData.fitnessLevel.runningDuration) || 0;

  // Recommendations for Increase Distance
  const getRecDistances = () => {
    if (currentDist > 0) {
      if (currentDist < 5) return [`${currentDist + 1}`, `${currentDist + 3}`, '5', '10'];
      if (currentDist === 5) return ['6', '8', '10'];
      if (currentDist === 10) return ['12', '15', '21.1'];
      return [`${currentDist + 2}`, `${currentDist + 5}`, `${currentDist + 10}`];
    }
    return ['3', '5', '10'];
  };
  const recDistances = getRecDistances();

  const resetForm = () => {
    setDistSelect('');
    setCustomDist('');
    setDurSelect('');
    setCustomHrs('');
    setCustomMins('');
    setEventSelect('');
    setCustomEvent('');
    setBuddyStatus('');
    setEnduranceFocus('');
    setDateSelect('');
    setCustomDate('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!goalType) {
      newErrors.goalType = 'เลือก Challenge ที่อยากเริ่มก่อน';
      setErrors(newErrors);
      return false;
    }

    if (goalType === 'increase_distance') {
      if (!distSelect) newErrors.distance = 'ระบุระยะทางที่อยากไปให้ถึง';
      if (distSelect === 'custom') {
        const d = Number(customDist);
        if (!customDist.trim()) newErrors.distance = 'ระบุระยะทางที่อยากไปให้ถึง';
        else if (currentDist > 0 && d <= currentDist) newErrors.distance = 'เป้าหมายควรมากกว่าระยะทางปัจจุบัน';
      }
    }

    if (goalType === 'improve_time') {
      if (!distSelect) newErrors.distance = 'ระบุระยะทาง';
      if (!durSelect) newErrors.duration = 'ระบุเวลาที่อยากทำให้ได้';
      if (durSelect === 'custom') {
        const h = Number(customHrs) || 0;
        const m = Number(customMins) || 0;
        const total = h * 60 + m;
        if (total === 0) newErrors.duration = 'ระบุเวลาที่อยากทำให้ได้';
        else if (distSelect === String(currentDist) && currentDur > 0 && total >= currentDur) {
          newErrors.duration = 'ลองเลือกเวลาที่เร็วกว่าสถิติปัจจุบัน';
        }
      }
    }

    if (goalType === 'prepare_event' || goalType === 'buddy_event') {
      if (!eventSelect) newErrors.event = 'เลือกว่ามีรายการแข่งขันในใจหรือไม่';
      if (eventSelect === 'custom_event' && !customEvent.trim()) newErrors.event = 'ระบุชื่อรายการแข่งขัน';
    }

    // Check target date for applicable goals
    if (goalType !== 'recommend_for_me' && eventSelect !== 'system_event') {
      if (!dateSelect) newErrors.date = 'ระบุวันที่เป้าหมาย';
      if (dateSelect === 'custom_date') {
        if (!customDate) newErrors.date = 'ระบุวันที่เป้าหมาย';
        else {
          const selectedDate = new Date(customDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) newErrors.date = 'เลือกวันที่ตั้งแต่วันนี้เป็นต้นไป';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    if (!goalType) return false;
    if (goalType === 'recommend_for_me') return true;

    if (goalType === 'increase_distance') {
      if (!distSelect) return false;
      if (distSelect === 'custom' && (!customDist || (currentDist > 0 && Number(customDist) <= currentDist))) return false;
    }

    if (goalType === 'improve_time') {
      if (!distSelect || !durSelect) return false;
      if (durSelect === 'custom') {
        const total = (Number(customHrs) || 0) * 60 + (Number(customMins) || 0);
        if (total === 0) return false;
        if (distSelect === String(currentDist) && currentDur > 0 && total >= currentDur) return false;
      }
    }

    if (goalType === 'prepare_event' || goalType === 'buddy_event') {
      if (!eventSelect) return false;
      if (eventSelect === 'custom_event' && !customEvent.trim()) return false;
    }

    if (goalType === 'improve_endurance') {
      if (!enduranceFocus) return false;
    }

    if (eventSelect !== 'system_event') {
      if (!dateSelect) return false;
      if (dateSelect === 'custom_date') {
        if (!customDate) return false;
        const selectedDate = new Date(customDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    setShowValidation(true);
    setSubmitError('');

    if (validate()) {
      setIsSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onNext();
      } catch (error) {
        setSubmitError('บันทึก Challenge ไม่สำเร็จ กรุณาลองอีกครั้ง');
      } finally {
        setIsSubmitting(false);
      }
    }
  };



  const renderIncreaseDistance = () => (
    <div className="onboarding-fade-in">
      <label className="onboarding-label">ครั้งต่อไปอยากวิ่งให้ถึงกี่กิโลเมตร?</label>
      <div className="onboarding-pill-container">
        {recDistances.map(val => <PillButton key={val} label={`${val} กม.`} isSelected={distSelect === val} onClick={() => { setDistSelect(val); if (showValidation) validate(); }} />)}
        <PillButton label="ระบุเอง" isSelected={distSelect === 'custom'} onClick={() => { setDistSelect('custom'); if (showValidation) validate(); }} />
        <PillButton label="ยังไม่แน่ใจ" isSelected={distSelect === 'not_sure'} onClick={() => { setDistSelect('not_sure'); if (showValidation) validate(); }} />
      </div>

      {distSelect === 'custom' && (
        <FormSection error={showValidation && errors.distance}>
          <InputWrapper suffix="กม." className="max-w-[200px]">
            <input
              type="number"
              value={customDist}
              onChange={(e) => { setCustomDist(e.target.value); if (showValidation) validate(); }}
              className={`w-full pr-48 bg-white ${showValidation && errors.distance ? 'input-error' : ''}`}
              placeholder="เช่น 12.5"
              step="0.01"
              min="0.01"
            />
          </InputWrapper>
        </FormSection>
      )}
    </div>
  );

  const renderImproveTime = () => (
    <div className="onboarding-fade-in">
      <label className="onboarding-label">อยากทำเวลาให้ดีขึ้นในระยะไหน?</label>
      <div className="onboarding-pill-container">
        {['3', '5', '10'].map(val => <PillButton key={val} label={`${val} กม.`} isSelected={distSelect === val} onClick={() => { setDistSelect(val); if (showValidation) validate(); }} />)}
        <PillButton label="ระบุเอง" isSelected={distSelect === 'custom'} onClick={() => { setDistSelect('custom'); if (showValidation) validate(); }} />
      </div>

      {distSelect === 'custom' && (
        <div className="form-group mb-24">
          <InputWrapper suffix="กม." className="max-w-[200px]">
            <input
              type="number"
              value={customDist}
              onChange={(e) => { setCustomDist(e.target.value); if (showValidation) validate(); }}
              className={`w-full pr-48 bg-white ${errors.targetGoal ? 'input-error' : ''}`}
              placeholder="ระยะทาง"
              step="0.01"
              min="0.01"
            />
          </InputWrapper>
        </div>
      )}

      {distSelect && (
        <>
          <label className="onboarding-label mb-8">อยากทำระยะนี้ให้ได้ภายในเท่าไร?</label>
          {distSelect === String(currentDist) && currentDur > 0 && (
            <div className="onboarding-helper-text mb-12">ปัจจุบัน {currentDur} นาที</div>
          )}

          <div className="onboarding-pill-container">
            {distSelect === String(currentDist) && currentDur > 0 && (
              <>
                <PillButton label={`${Math.floor(currentDur * 0.95)} นาที`} isSelected={durSelect === String(Math.floor(currentDur * 0.95))} onClick={() => { setDurSelect(String(Math.floor(currentDur * 0.95))); if (showValidation) validate(); }} />
                <PillButton label={`${Math.floor(currentDur * 0.9)} นาที`} isSelected={durSelect === String(Math.floor(currentDur * 0.9))} onClick={() => { setDurSelect(String(Math.floor(currentDur * 0.9))); if (showValidation) validate(); }} />
              </>
            )}
            <PillButton label="30 นาที" isSelected={durSelect === '30'} onClick={() => { setDurSelect('30'); if (showValidation) validate(); }} />
            <PillButton label="ระบุเอง" isSelected={durSelect === 'custom'} onClick={() => { setDurSelect('custom'); if (showValidation) validate(); }} />
          </div>

          {durSelect === 'custom' && (
            <FormSection error={showValidation && errors.duration}>
              <div className="flex gap-16 items-center">
                <InputWrapper suffix="ชั่วโมง" className="w-[140px]">
                  <input
                    type="number"
                    value={customHrs}
                    onChange={(e) => { setCustomHrs(e.target.value); if (showValidation) validate(); }}
                    className={`w-full pr-64 text-center bg-white ${showValidation && errors.duration ? 'input-error' : ''}`}
                    placeholder="00"
                    min="0"
                  />
                </InputWrapper>
                <InputWrapper suffix="นาที" className="w-[140px]">
                  <input
                    type="number"
                    value={customMins}
                    onChange={(e) => { setCustomMins(e.target.value); if (showValidation) validate(); }}
                    className={`w-full pr-48 text-center bg-white ${showValidation && errors.duration ? 'input-error' : ''}`}
                    placeholder="00"
                    min="0"
                    max="59"
                  />
                </InputWrapper>
              </div>
            </FormSection>
          )}
        </>
      )}
    </div>
  );

  const renderPrepareEvent = () => (
    <div className="onboarding-fade-in">
      <label className="onboarding-label">มีสนามที่อยากไปพิชิตแล้วหรือยัง?</label>
      <div className="flex flex-col gap-8 mb-24">
        {EVENT_OPTIONS.map(opt => (
          <ChoiceCard
            key={opt.value}
            isSelected={eventSelect === opt.value}
            onClick={() => { setEventSelect(opt.value); if (showValidation) validate(); }}
            label={opt.label}
            className="items-start"
            hasCheckMark={false}
          />
        ))}
      </div>

      {eventSelect === 'custom_event' && (
        <FormSection
          label="ชื่อรายการแข่งขัน"
          error={showValidation && errors.event}
        >
          <input
            type="text"
            value={customEvent}
            onChange={(e) => { setCustomEvent(e.target.value); if (showValidation) validate(); }}
            className={`w-full bg-white ${showValidation && errors.event ? 'input-error' : ''}`}
            placeholder="เช่น HYROX Bangkok"
          />
        </FormSection>
      )}
    </div>
  );

  const renderBuddyEvent = () => (
    <div className="onboarding-fade-in">
      {renderPrepareEvent()}

      {eventSelect && (
        <>
          <label className="onboarding-label">ตอนนี้มี Buddy แล้วหรือยัง?</label>
          <div className="flex flex-col gap-8 mb-24">
            {BUDDY_OPTIONS.map(opt => (
              <ChoiceCard
                key={opt.value}
                isSelected={buddyStatus === opt.value}
                onClick={() => setBuddyStatus(opt.value)}
                label={opt.label}
                className="items-start"
                hasCheckMark={false}
              />
            ))}
          </div>
          {buddyStatus === 'looking_for_buddy' && (
            <FeedbackCard className="mb-24 p-[12px_16px] bg-white">
              <p className="text-sm text-neutral-700 m-0">
                หลังจากรู้ Level แล้ว เราจะช่วยแนะนำ Buddy ที่มีจังหวะใกล้กับคุณ
              </p>
            </FeedbackCard>
          )}
        </>
      )}
    </div>
  );

  const renderImproveEndurance = () => (
    <div className="onboarding-fade-in">
      <label className="onboarding-label">อยากพัฒนาด้านไหนมากที่สุด?</label>
      <div className="onboarding-pill-container">
        {ENDURANCE_OPTIONS.map(opt => <PillButton key={opt.value} label={opt.label} isSelected={enduranceFocus === opt.value} onClick={() => setEnduranceFocus(opt.value)} />)}
      </div>
    </div>
  );

  const renderTargetDate = () => {
    if (!goalType || goalType === 'recommend_for_me' || eventSelect === 'system_event') return null;

    if (goalType === 'increase_distance' && !distSelect) return null;
    if (goalType === 'improve_time' && (!distSelect || !durSelect)) return null;
    if (goalType === 'prepare_event' && !eventSelect) return null;
    if (goalType === 'buddy_event' && !eventSelect) return null;
    if (goalType === 'improve_endurance' && !enduranceFocus) return null;

    return (
      <div className="onboarding-fade-in mt-32">
        <label className="onboarding-label">อยากพิชิต Challenge นี้เมื่อไร? 📅</label>
        <div className="onboarding-pill-container">
          {TARGET_DATE_OPTIONS.map(opt => <PillButton key={opt.value} label={opt.label} isSelected={dateSelect === opt.value} onClick={() => { setDateSelect(opt.value); if (showValidation) validate(); }} />)}
        </div>

        {dateSelect === 'custom_date' && (
          <FormSection error={showValidation && errors.date}>
            <input
              type="date"
              value={customDate}
              onChange={(e) => { setCustomDate(e.target.value); if (showValidation) validate(); }}
              className={`w-full max-w-[240px] bg-white ${showValidation && errors.date ? 'input-error' : ''}`}
              min={new Date().toISOString().split("T")[0]}
            />
          </FormSection>
        )}
      </div>
    );
  };

  const getPreviewDate = () => {
    if (eventSelect === 'system_event') return '14 ธันวาคม 2026';
    if (dateSelect === 'plus_1_month') return 'ภายใน 1 เดือนนี้';
    if (dateSelect === 'plus_3_months') return 'ภายใน 3 เดือนนี้';
    if (dateSelect === 'plus_6_months') return 'ภายใน 6 เดือนนี้';
    if (dateSelect === 'custom_date' && customDate) return `ภายใน ${customDate}`;
    return '';
  };

  const renderFeedbackPreview = () => {
    if (goalType === 'recommend_for_me') {
      return (
        <FeedbackCard title="ได้เลย เดี๋ยวเราช่วยเลือกให้ ✨">
          <p className="text-sm text-neutral-700">
            Lowrox จะใช้ Level จุดเริ่มต้น และเวลาที่คุณสะดวก เพื่อแนะนำ Challenge ที่เหมาะสม
          </p>
        </FeedbackCard>
      );
    }

    if (!isFormValid()) return null;

    let previewContent = null;
    const pDate = getPreviewDate();

    if (goalType === 'increase_distance') {
      const targetVal = distSelect === 'custom' ? customDist : distSelect;
      previewContent = (
        <>
          <div className="text-[16px] font-semibold text-brand-600">
            วิ่ง {currentDist > 0 ? `จาก ${currentDist} กม. ` : ''}ให้ถึง {targetVal} กม.
          </div>
          {pDate && <div className="text-sm mt-4 font-semibold text-brand-600">{pDate}</div>}
        </>
      );
    } else if (goalType === 'improve_time') {
      const dist = distSelect === 'custom' ? customDist : distSelect;
      const dur = durSelect === 'custom' ? ((Number(customHrs) || 0) * 60 + (Number(customMins) || 0)) : durSelect;
      previewContent = (
        <>
          <div className="text-[16px] font-semibold text-brand-600">
            วิ่ง {dist} กม. ให้ได้ภายใน {dur} นาที
          </div>
          {dist === String(currentDist) && currentDur > 0 && (
            <div className="text-sm text-neutral-600 mt-4">
              ปัจจุบันประมาณ {currentDur} นาที
            </div>
          )}
          {pDate && <div className="text-sm mt-4 font-semibold text-brand-600">{pDate}</div>}
        </>
      );
    } else if (goalType === 'prepare_event' || goalType === 'buddy_event') {
      const evName = eventSelect === 'custom_event' ? customEvent : (eventSelect === 'system_event' ? 'BKK Night Run' : '(ยังไม่ระบุ)');
      previewContent = (
        <>
          <div className="text-[16px] font-semibold text-brand-600">
            เตรียมลง {evName} {goalType === 'buddy_event' ? 'แบบ Buddy' : ''}
          </div>
          {goalType === 'buddy_event' && buddyStatus === 'looking_for_buddy' && (
            <div className="text-sm text-neutral-600 mt-4">
              และหา Buddy ที่ Level ใกล้กัน
            </div>
          )}
          {pDate && <div className="text-sm mt-4 font-semibold text-brand-600">{pDate}</div>}
        </>
      );
    } else if (goalType === 'improve_endurance') {
      const lbl = ENDURANCE_OPTIONS.find(o => o.value === enduranceFocus)?.label || '';
      previewContent = (
        <>
          <div className="text-[16px] font-semibold text-brand-600">
            โฟกัส: {lbl}
          </div>
          {pDate && <div className="text-sm mt-4 font-semibold text-brand-600">{pDate}</div>}
        </>
      );
    }

    if (previewContent) {
      return (
        <FeedbackCard title="Challenge ของคุณ" icon="🎯" className="mt-24">
          {previewContent}
        </FeedbackCard>
      );
    }
    return null;
  };

  const getCtaLabel = () => {
    if (isSubmitting) return 'กำลังบันทึก...';
    if (goalType === 'recommend_for_me') return 'ให้ Lowrox ช่วยเลือก →';
    return 'ตั้ง Challenge นี้ →';
  };


  const formContent = (
    <>
        {submitError && (
          <div className="error-message-area mb-24" role="alert">
            {submitError}
          </div>
        )}

        {/* Primary Choice Cards */}
        <div className="onboarding-choice-grid">
          {GOAL_TYPES.map(opt => {
            const isSelected = goalType === opt.value;
            return (
              <ChoiceCard
                key={opt.value}
                isSelected={goalType === opt.value}
                onClick={() => { setGoalType(opt.value); resetForm(); if (showValidation) validate(); }}
                icon={<span className="mr-16 flex items-center justify-center">{opt.icon}</span>}
                label={<span className="text-[15px] font-semibold">{opt.label}</span>}
                description=""
                className="flex-col items-start p-16 border-2 transition-all duration-200 hover:border-brand-300 hover:shadow-sm"
              />
            );
          })}
        </div>

        {/* Conditional Questions Box */}
        {goalType && (
          <div className="onboarding-fade-in mt-16 p-16 rounded-xl border border-brand-200 bg-brand-50">
            {goalType === 'increase_distance' && renderIncreaseDistance()}
            {goalType === 'improve_time' && renderImproveTime()}
            {goalType === 'prepare_event' && renderPrepareEvent()}
            {goalType === 'buddy_event' && renderBuddyEvent()}
            {goalType === 'improve_endurance' && renderImproveEndurance()}

            {renderTargetDate()}
          </div>
        )}

        {/* Preview is full width outside the box, but inside the main container */}
        {goalType && renderFeedbackPreview()}
    </>
  );

  if (isEditor) {
    return <div className="onboarding-editor-section">{formContent}</div>;
  }

  return (
    <>
      <div className="onboarding-modal-body">
        {/* Header Section */}
        <div className="onboarding-fullwidth-header">
          <img
            src={ONBOARDING_STEP_ILLUSTRATIONS.nextChallenge}
            alt="Lowrox next challenge illustration"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="onboarding-text-align">
            <h2 className="heading-2 mb-8">Challenge ต่อไปคืออะไร? 🏁</h2>
            <p className="body-md text-neutral-600">
              เลือกสิ่งที่อยากพิชิตที่สุดก่อน เราจะช่วยวางก้าวต่อไปให้คุณ
            </p>
          </div>
        </div>

        {formContent}
      </div>

      <div className="onboarding-modal-footer">
        <button
          className="btn btn-secondary btn-sm w-auto mr-16"
          onClick={onPrev}
        >
          ← ย้อนกลับ
        </button>
        <button
          className="btn btn-primary btn-md btn-cta w-full"
          onClick={handleNext}
          disabled={!isFormValid() || isSubmitting}
        >
          {getCtaLabel()}
        </button>
      </div>
    </>
  );
});

export default StepGoals;
