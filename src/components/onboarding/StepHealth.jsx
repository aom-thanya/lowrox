import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import step5Img from '../../assets/onboarding/step5.png';
import ChoiceCard from '../common/ChoiceCard';
import PillButton from '../common/PillButton';
import FormSection from '../common/FormSection';
import FeedbackCard from '../common/FeedbackCard';
import { CheckCircle2, Bandage, HeartPulse, Pill, ClipboardList, HelpCircle, TriangleAlert, CheckCircle, ShieldAlert, Lock, Info } from 'lucide-react';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  safetyCheck: step5Img
};

const MAIN_OPTIONS = [
  { value: 'none', label: 'ไม่มีเรื่องที่ต้องระวัง', desc: 'สุขภาพแข็งแรง พร้อมลุยได้เลย', icon: <CheckCircle2 /> },
  { value: 'injury', label: 'มีอาการบาดเจ็บหรือปวดอยู่', desc: 'เช่น ปวดเข่า ไหล่ หลัง เป็นต้น', icon: <Bandage /> },
  { value: 'health_condition', label: 'มีภาวะสุขภาพที่เกี่ยวข้อง', desc: 'เช่น ความดัน เบาหวาน หอบหืด เป็นต้น', icon: <HeartPulse /> },
  { value: 'medication', label: 'มียาที่เกี่ยวข้อง', desc: 'เช่น ยาความดัน ยาเบาหวาน เป็นต้น', icon: <Pill /> },
  { value: 'other_restriction', label: 'มีข้อจำกัดอื่น', desc: 'เช่น จำกัดการกระโดด จำกัดน้ำหนัก', icon: <ClipboardList /> },
  { value: 'unsure', label: 'ยังไม่แน่ใจ', desc: 'ขอข้ามไปก่อนก็ได้', icon: <HelpCircle /> }
];

const INJURY_PARTS = ['เข่า', 'ข้อเท้า', 'เท้าหรือฝ่าเท้า', 'สะโพก', 'หลัง', 'ไหล่', 'แขนหรือข้อมือ', 'อื่น ๆ'];
const RESTRICTION_LEVELS = [
  { value: 'mild', label: 'รบกวนเล็กน้อย' },
  { value: 'moderate', label: 'ต้องปรับบางกิจกรรม' },
  { value: 'high', label: 'ต้องหลีกเลี่ยงบางกิจกรรม' }
];
const OTHER_RESTRICTIONS = ['หลีกเลี่ยงการกระโดด', 'หลีกเลี่ยงแรงกระแทก', 'หลีกเลี่ยงการยกน้ำหนักมาก', 'ต้องมีช่วงพักเพิ่มเติม', 'จำกัดระยะเวลาการออกกำลังกาย', 'อื่น ๆ'];

const STATUS_MAPPING = {
  'active': { label: 'ยังมีผลอยู่', is_active: true },
  'intermittent': { label: 'เป็นบางครั้ง', is_active: true },
  'resolved': { label: 'ไม่มีผลแล้ว', is_active: false }
};

const StepHealth = forwardRef(({ onNext, onPrev, isEditor, externalShowValidation }, ref) => {
  const { formData, updateFormData, submitForm } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [internalShowValidation, setShowValidation] = useState(false);
  const showValidation = internalShowValidation || externalShowValidation;

  useImperativeHandle(ref, () => ({
    validate: () => {
      // StepHealth doesn't have a direct top-level validate like others.
      // We check mainSelection and concerns.
      if (mainSelection.length === 0) {
        setErrors({ main: 'เลือกคำตอบที่ใกล้เคียงกับคุณ' });
        return false;
      }
      if (!mainSelection.includes('none') && !mainSelection.includes('unsure')) {
        if (concerns.length === 0) {
          setErrors({ main: 'กรุณาระบุรายละเอียด หรือเลือก "ไม่มีเรื่องที่ต้องระวัง"' });
          return false;
        }
      }
      return true;
    }
  }));

  const safetyCheck = formData.safetyCheck || { mainSelection: [], concerns: [] };
  const { mainSelection, concerns } = safetyCheck;

  // UI state for inline form
  const [activeFormType, setActiveFormType] = useState(null);
  const [tempConcern, setTempConcern] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDateFields, setShowDateFields] = useState(false);

  const updateSafetyCheck = (field, value) => {
    updateFormData('safetyCheck', { ...safetyCheck, [field]: value });
  };

  const handleMainSelection = (val) => {
    let newSelection = [...mainSelection];

    if (val === 'none' || val === 'unsure') {
      newSelection = [val];
      // clear active form
      setActiveFormType(null);
      setTempConcern(null);
    } else {
      newSelection = newSelection.filter(item => item !== 'none' && item !== 'unsure');
      if (newSelection.includes(val)) {
        newSelection = newSelection.filter(item => item !== val);
        if (activeFormType === val) {
          setActiveFormType(null);
          setTempConcern(null);
        }
      } else {
        newSelection.push(val);
        // open form automatically for this type
        openForm(val);
      }
    }

    updateSafetyCheck('mainSelection', newSelection);
  };

  const getInitialTempConcern = (type) => ({
    concern_type: type,
    concern_name: type === 'injury' || type === 'other_restriction' ? [] : '',
    medication_name: '',
    restriction_level: '',
    restriction_note: '',
    start_date: '',
    end_date: '',
    status: 'active',
    is_active: true,
    custom_concern_name: '' // for 'อื่น ๆ'
  });

  const openForm = (type, index = null) => {
    setActiveFormType(type);
    setShowDateFields(false);
    if (index !== null) {
      setEditingIndex(index);
      setTempConcern({ ...concerns[index] });
    } else {
      setEditingIndex(null);
      setTempConcern(getInitialTempConcern(type));
    }
    setErrors({});
  };

  const closeForm = () => {
    setActiveFormType(null);
    setTempConcern(null);
    setEditingIndex(null);
    setErrors({});
  };

  const handleTempChange = (field, value) => {
    setTempConcern(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const ne = { ...prev }; delete ne[field]; return ne; });
    }
  };

  const validateTemp = () => {
    const ne = {};
    if (tempConcern.concern_type === 'injury') {
      if (!tempConcern.concern_name || tempConcern.concern_name.length === 0) ne.concern_name = 'เลือกบริเวณที่มีอาการ';
      if (tempConcern.concern_name.includes('อื่น ๆ') && !tempConcern.custom_concern_name) ne.custom_concern_name = 'ระบุอาการบริเวณอื่น';
      if (!tempConcern.restriction_level) ne.restriction_level = 'บอกเราว่าเรื่องนี้กระทบการออกกำลังกายแค่ไหน';
    } else if (tempConcern.concern_type === 'health_condition') {
      if (!tempConcern.concern_name) ne.concern_name = 'ระบุภาวะสุขภาพที่เกี่ยวข้อง';
      if (!tempConcern.restriction_level) ne.restriction_level = 'บอกเราว่าเรื่องนี้กระทบการออกกำลังกายแค่ไหน';
    } else if (tempConcern.concern_type === 'medication') {
      if (!tempConcern.medication_name) ne.medication_name = 'ระบุชื่อยา หรือเลือก "ไม่ทราบชื่อ"';
    } else if (tempConcern.concern_type === 'other_restriction') {
      if (!tempConcern.concern_name || tempConcern.concern_name.length === 0) ne.concern_name = 'ระบุสิ่งที่ควรระวัง';
      if (tempConcern.concern_name.includes('อื่น ๆ') && !tempConcern.custom_concern_name) ne.custom_concern_name = 'ระบุข้อจำกัดอื่น';
    }

    if (showDateFields) {
      if (tempConcern.start_date && tempConcern.end_date && tempConcern.end_date < tempConcern.start_date) {
        ne.dates = 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น';
      }
    }

    setErrors(ne);
    return Object.keys(ne).length === 0;
  };

  const saveForm = () => {
    if (!validateTemp()) return;

    const newConcerns = [...concerns];
    const finalConcern = { ...tempConcern };

    // map status to is_active
    finalConcern.is_active = STATUS_MAPPING[finalConcern.status].is_active;

    if (editingIndex !== null) {
      newConcerns[editingIndex] = finalConcern;
    } else {
      if (newConcerns.length >= 5) {
        setSubmitError('คุณเพิ่มข้อจำกัดได้สูงสุด 5 รายการในขั้นตอนนี้');
        return;
      }
      newConcerns.push(finalConcern);
    }

    updateSafetyCheck('concerns', newConcerns);
    closeForm();
  };

  const removeConcern = (index) => {
    const newConcerns = concerns.filter((_, i) => i !== index);
    updateSafetyCheck('concerns', newConcerns);
  };

  const handleNext = async () => {
    if (mainSelection.length === 0) {
      setErrors({ main: 'เลือกคำตอบที่ใกล้เคียงกับคุณ' });
      return;
    }
    if (!mainSelection.includes('none') && !mainSelection.includes('unsure')) {
      if (concerns.length === 0) {
        setErrors({ main: 'กรุณาระบุรายละเอียด หรือเลือก "ไม่มีเรื่องที่ต้องระวัง"' });
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Simulate saving or transitioning to the next step
      await new Promise((resolve) => setTimeout(resolve, 500));
      onNext();
    } catch (err) {
      setSubmitError('บันทึกข้อมูลยังไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCtaLabel = () => {
    if (isSubmitting) return 'กำลังประมวลผล...';
    if (mainSelection.includes('none')) return 'ตรวจสอบข้อมูล →';
    if (mainSelection.includes('unsure')) return 'ข้ามไปตรวจสอบข้อมูล →';
    if (concerns.length > 0) return 'บันทึกและตรวจสอบข้อมูล →';
    return 'ตรวจสอบข้อมูล →';
  };

  const isCtaDisabled = () => {
    if (isSubmitting) return true;
    if (mainSelection.length === 0) return true;
    if (!mainSelection.includes('none') && !mainSelection.includes('unsure') && concerns.length === 0) return true;
    return false;
  };

  // ---------------- UI Helpers ----------------


  const renderMultiSelectPills = (options, currentSelections, field) => (
    <div className="onboarding-pill-container gap-8">
      {options.map(opt => {
        const isSelected = currentSelections.includes(opt);
        return <PillButton key={opt} label={opt} isSelected={isSelected} onClick={() => {
          let current = [...currentSelections];
          if (isSelected) {
            current = current.filter(val => val !== opt);
          } else {
            current.push(opt);
          }
          handleTempChange(field, current);
        }} />;
      })}
    </div>
  );

  const renderFormContent = () => {
    if (!activeFormType || !tempConcern) return null;
    const typeLabel = MAIN_OPTIONS.find(o => o.value === activeFormType)?.label;

    return (
      <div className="onboarding-fade-in bg-brand-50 p-24 rounded-2xl mt-16">
        <div className="flex justify-between items-center mb-24">
          <h3 className="text-brand-600 font-bold text-[16px]">รายละเอียด: {typeLabel}</h3>
          <button type="button" onClick={closeForm} className="bg-transparent border-none text-[20px] cursor-pointer text-neutral-500">✕</button>
        </div>

        {activeFormType === 'injury' && (
          <>
            <FormSection label="มีอาการบริเวณไหน?" error={errors.concern_name}>
              {renderMultiSelectPills(INJURY_PARTS, tempConcern.concern_name || [], 'concern_name')}
              {tempConcern.concern_name?.includes('อื่น ๆ') && (
                <input type="text" value={tempConcern.custom_concern_name} onChange={e => handleTempChange('custom_concern_name', e.target.value)} placeholder="ระบุบริเวณ" className={`w-full mt-16 bg-white ${errors.custom_concern_name ? 'input-error' : ''}`} />
              )}
            </FormSection>

            <FormSection label="ตอนนี้อาการกระทบการออกกำลังกายแค่ไหน?" error={errors.restriction_level}>
              <div className="onboarding-pill-container gap-8">
                {RESTRICTION_LEVELS.map(lvl => <PillButton key={lvl.value} label={lvl.label} isSelected={tempConcern.restriction_level === lvl.value} onClick={() => handleTempChange('restriction_level', lvl.value)} />)}
              </div>
            </FormSection>

            <FormSection label="มีอะไรที่อยากให้เราระวังเป็นพิเศษไหม? (Optional)">
              <textarea value={tempConcern.restriction_note} onChange={e => handleTempChange('restriction_note', e.target.value)} placeholder="เช่น หลีกเลี่ยงการกระโดดหรือใช้แรงกดเข่า" rows="2" className="w-full p-[12px] border border-neutral-300 rounded-xl" />
            </FormSection>
          </>
        )}

        {activeFormType === 'health_condition' && (
          <>
            <FormSection label="มีภาวะสุขภาพอะไรที่เกี่ยวข้อง?" error={errors.concern_name}>
              <input type="text" value={tempConcern.concern_name} onChange={e => handleTempChange('concern_name', e.target.value)} placeholder="ระบุเฉพาะข้อมูลที่เกี่ยวข้องกับการออกกำลังกาย" className={`w-full bg-white ${errors.concern_name ? 'input-error' : ''}`} />
            </FormSection>

            <FormSection label="มีข้อแนะนำหรือสิ่งที่ควรหลีกเลี่ยงไหม? (Optional)">
              <textarea value={tempConcern.restriction_note} onChange={e => handleTempChange('restriction_note', e.target.value)} placeholder="เช่น ควรพักเมื่อมีอาการ หรือหลีกเลี่ยงกิจกรรมบางประเภท" rows="2" className="w-full p-[12px] border border-neutral-300 rounded-xl" />
            </FormSection>

            <FormSection label="เรื่องนี้กระทบการออกกำลังกายแค่ไหน?" error={errors.restriction_level}>
              <div className="onboarding-pill-container gap-8">
                {RESTRICTION_LEVELS.map(lvl => <PillButton key={lvl.value} label={lvl.label} isSelected={tempConcern.restriction_level === lvl.value} onClick={() => handleTempChange('restriction_level', lvl.value)} />)}
              </div>
            </FormSection>
          </>
        )}

        {activeFormType === 'medication' && (
          <>
            <FormSection label="มียาอะไรที่เกี่ยวข้อง?" error={errors.medication_name}>
              <input type="text" value={tempConcern.medication_name} onChange={e => handleTempChange('medication_name', e.target.value)} placeholder="ระบุชื่อยา หากทราบ" className={`w-full bg-white ${errors.medication_name ? 'input-error' : ''}`} />
            </FormSection>

            <FormSection label="มีสิ่งที่ต้องระวังจากยานี้ไหม? (Optional)">
              <textarea value={tempConcern.restriction_note} onChange={e => handleTempChange('restriction_note', e.target.value)} placeholder="ระบุเฉพาะข้อมูลที่เกี่ยวข้องกับการออกกำลังกาย" rows="2" className="w-full p-[12px] border border-neutral-300 rounded-xl" />
            </FormSection>
          </>
        )}

        {activeFormType === 'other_restriction' && (
          <FormSection label="มีอะไรที่ควรหลีกเลี่ยงหรือปรับให้คุณบ้าง?" error={errors.concern_name}>
            {renderMultiSelectPills(OTHER_RESTRICTIONS, tempConcern.concern_name || [], 'concern_name')}
            {tempConcern.concern_name?.includes('อื่น ๆ') && (
              <input type="text" value={tempConcern.custom_concern_name} onChange={e => handleTempChange('custom_concern_name', e.target.value)} placeholder="ระบุสิ่งที่ควรระวัง" className={`w-full mt-16 bg-white ${errors.custom_concern_name ? 'input-error' : ''}`} />
            )}
          </FormSection>
        )}

        <hr className="border-none border-t border-brand-200 my-24" />

        {/* Active Status */}
        <FormSection label="เรื่องนี้ยังมีผลอยู่ตอนนี้ไหม?">
          <div className="onboarding-pill-container gap-8">
            {['active', 'intermittent', 'resolved'].map(status => <PillButton key={status} label={STATUS_MAPPING[status].label} isSelected={tempConcern.status === status} onClick={() => handleTempChange('status', status)} />)}
          </div>
        </FormSection>

        {/* Dates */}
        <FormSection error={errors.dates}>
          {!showDateFields ? (
            <button type="button" onClick={() => setShowDateFields(true)} className="bg-transparent border-none text-brand-600 font-semibold cursor-pointer text-sm underline block">
              + เพิ่มช่วงเวลาของอาการ (Optional)
            </button>
          ) : (
            <div className="flex flex-wrap gap-16">
              <div className="flex-1 min-w-[120px]">
                <label className="onboarding-label text-[13px] font-normal">เริ่มมีอาการเมื่อ</label>
                <input type="date" value={tempConcern.start_date} onChange={e => handleTempChange('start_date', e.target.value)} className="w-full bg-white" max={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="onboarding-label text-[13px] font-normal">สิ้นสุดเมื่อ</label>
                <input type="date" value={tempConcern.end_date} onChange={e => handleTempChange('end_date', e.target.value)} className="w-full bg-white" disabled={tempConcern.status === 'active' || tempConcern.status === 'intermittent'} />
              </div>
            </div>
          )}
        </FormSection>

        <div className="flex justify-end gap-12">
          <button type="button" className="btn btn-secondary btn-sm" onClick={closeForm}>ยกเลิก</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={saveForm}>ยืนยัน</button>
        </div>
      </div>
    );
  };

  const getSummaryCard = () => {
    if (concerns.length === 0) return null;
    return (
      <FeedbackCard className="mt-24">
        <h4 className="text-[13px] font-bold text-brand-600 mb-16 flex items-center">
          <span className="text-[18px] mr-8">🛡️</span>สิ่งที่เราจะคำนึงถึง
        </h4>
        <div className="flex flex-col gap-16">
          {concerns.map((c, i) => {
            const typeLabel = MAIN_OPTIONS.find(o => o.value === c.concern_type)?.label;
            const nameStr = Array.isArray(c.concern_name) ?
              c.concern_name.map(n => n === 'อื่น ๆ' ? c.custom_concern_name : n).join(', ') :
              (c.concern_name || c.medication_name);
            const levelLabel = RESTRICTION_LEVELS.find(l => l.value === c.restriction_level)?.label;

            return (
              <div key={i} className={i < concerns.length - 1 ? 'border-b border-neutral-200 pb-16' : ''}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-[14px] text-neutral-800">
                      {typeLabel} {nameStr ? ` — ${nameStr}` : ''}
                    </div>
                    {levelLabel && <div className="text-[13px] text-neutral-600 mt-4">• {levelLabel}</div>}
                    {c.restriction_note && <div className="text-[13px] text-neutral-600 mt-4">• {c.restriction_note}</div>}
                    <div className="text-[13px] text-brand-500 mt-4">• {STATUS_MAPPING[c.status].label}</div>
                  </div>
                  <button type="button" onClick={() => openForm(c.concern_type, i)} className="bg-transparent border-none text-neutral-500 text-[13px] underline cursor-pointer">แก้ไข</button>
                </div>
              </div>
            );
          })}
        </div>
      </FeedbackCard>
    );
  };


  const formContent = (
    <>
        <div className="onboarding-privacy-notice">
          <span className="text-neutral-500 mr-12"><Lock size={24} /></span>
          <div>
            <p className="body-sm text-neutral-700 m-0 font-semibold">ข้อมูลนี้เป็นเรื่องส่วนตัว</p>
            <p className="text-sm text-neutral-600 mt-1">คุณเลือกบอกเฉพาะสิ่งที่สะดวกได้ และกลับมาแก้ไขภายหลังได้เสมอ</p>
          </div>
        </div>
        {submitError && (
          <div className="error-message-area mb-24" role="alert">
            {submitError}
          </div>
        )}
        {errors.main && (
          <div className="error-message-area mb-24" role="alert">
            {errors.main}
          </div>
        )}

        <div>
          <h3 className="onboarding-label text-center">ตอนออกกำลังกาย มีเรื่องไหนที่เราควรระวังให้คุณไหม?</h3>

          <div className="onboarding-choice-grid">
            {MAIN_OPTIONS.map(opt => {
              const isSelected = mainSelection.includes(opt.value);
              return (
                <ChoiceCard
                  key={opt.value}
                  isSelected={isSelected}
                  onClick={() => handleMainSelection(opt.value)}
                  icon={<span className="flex items-center text-brand-500 mr-8">{opt.icon}</span>}
                  label={<span className="text-[15px] font-semibold">{opt.label}</span>}
                  description={<span className="text-[13px] text-neutral-500">{opt.desc}</span>}
                  className="p-16 items-center flex-row justify-start min-h-[80px]"
                />
              );
            })}
          </div>

          {/* Inline Form */}
          {renderFormContent()}

          {/* Special states feedbacks */}
          {mainSelection.includes('none') && (
            <FeedbackCard className="mt-24 bg-success-soft border border-success">
              <p className="m-0 text-success font-semibold flex items-center gap-8">
                <span className="text-[18px]">✅</span> พร้อมแล้ว เราจะใช้ข้อมูลที่มีเพื่อแนะนำจุดเริ่มต้นให้คุณ
              </p>
            </FeedbackCard>
          )}
          {mainSelection.includes('unsure') && (
            <FeedbackCard className="mt-24">
              <p className="m-0 text-neutral-700 flex items-center gap-8">
                <span className="text-brand-500 mr-8"><Info size={20} /></span> ไม่เป็นไร คุณกลับมาเพิ่มหรือแก้ไขข้อมูลนี้ใน Profile ได้ภายหลัง
              </p>
            </FeedbackCard>
          )}

          {/* Summary Card */}
          {!mainSelection.includes('none') && !mainSelection.includes('unsure') && getSummaryCard()}

          {/* Add more button */}
          {!mainSelection.includes('none') && !mainSelection.includes('unsure') && concerns.length > 0 && concerns.length < 5 && !activeFormType && (
            <button
              type="button"
              onClick={() => openForm(mainSelection[0])}
              className="mt-16 block w-full p-[12px] rounded-xl border border-dashed border-brand-400 bg-white text-brand-600 font-semibold cursor-pointer text-sm"
            >
              + เพิ่มอีกเรื่อง
            </button>
          )}

          <div className="onboarding-helper-text mt-32 text-center">
            ⓘ Lowrox ใช้ข้อมูลนี้เพื่อปรับคำแนะนำเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยหรือการรับรองความพร้อมทางการแพทย์
          </div>
        </div>
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
            src={ONBOARDING_STEP_ILLUSTRATIONS.safetyCheck}
            alt="Lowrox safety check illustration"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="onboarding-text-align">
            <h2 className="heading-2 mb-8 flex items-center">ก่อนเริ่ม มีอะไรที่เราควรรู้ไหม? <ShieldAlert size={28} className="ml-8 text-brand-500" /></h2>
            <p className="body-md text-neutral-600">
              บอกเฉพาะเรื่องที่เกี่ยวข้องกับการออกกำลังกาย เพื่อให้คำแนะนำเหมาะกับคุณมากขึ้น
            </p>
          </div>
        </div>

        {formContent}
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
          disabled={isCtaDisabled()}
        >
          {getCtaLabel()}
        </button>
      </div>
    </>
  );
});

export default StepHealth;
