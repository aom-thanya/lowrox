import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import step5Img from '../../assets/onboarding/step5.png';

const ONBOARDING_STEP_ILLUSTRATIONS = {
  safetyCheck: step5Img
};

const MAIN_OPTIONS = [
  { value: 'none', label: 'ไม่มีเรื่องที่ต้องระวัง', desc: 'สุขภาพแข็งแรง พร้อมลุยได้เลย', icon: '✅' },
  { value: 'injury', label: 'มีอาการบาดเจ็บหรือปวดอยู่', desc: 'เช่น ปวดเข่า ไหล่ หลัง เป็นต้น', icon: '🩹' },
  { value: 'health_condition', label: 'มีภาวะสุขภาพที่เกี่ยวข้อง', desc: 'เช่น ความดัน เบาหวาน หอบหืด เป็นต้น', icon: '❤️' },
  { value: 'medication', label: 'มียาที่เกี่ยวข้อง', desc: 'เช่น ยาความดัน ยาเบาหวาน เป็นต้น', icon: '💊' },
  { value: 'other_restriction', label: 'มีข้อจำกัดอื่น', desc: 'เช่น จำกัดการกระโดด จำกัดน้ำหนัก', icon: '📋' },
  { value: 'unsure', label: 'ยังไม่แน่ใจ', desc: 'ขอข้ามไปก่อนก็ได้', icon: '❓' }
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

export default function StepHealth({ onNext, onPrev }) {
  const { formData, updateFormData, submitForm } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
      await submitForm(); // Context function that sets completed and mocks API call
      // The onComplete callback from Onboarding component will handle navigation to Result
    } catch (err) {
      setSubmitError('บันทึกข้อมูลยังไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCtaLabel = () => {
    if (isSubmitting) return 'กำลังประมวลผล...';
    if (mainSelection.includes('none')) return 'ดู Level ของฉัน →';
    if (mainSelection.includes('unsure')) return 'ข้ามไปดู Level →';
    if (concerns.length > 0) return 'บันทึกและดู Level →';
    return 'ดู Level ของฉัน →';
  };

  const isCtaDisabled = () => {
    if (isSubmitting) return true;
    if (mainSelection.length === 0) return true;
    if (!mainSelection.includes('none') && !mainSelection.includes('unsure') && concerns.length === 0) return true;
    return false;
  };

  // ---------------- UI Helpers ----------------
  const renderPillButton = (label, isSelected, onClick) => (
    <button
      type="button"
      className={`onboarding-pill-button ${isSelected ? 'selected' : ''}`}
      style={{ flex: '0 0 auto' }}
      onClick={onClick}
    >
      {isSelected && (
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {label}
    </button>
  );

  const renderMultiSelectPills = (options, currentSelections, field) => (
    <div className="onboarding-pill-container gap-8">
      {options.map(opt => {
        const isSelected = currentSelections.includes(opt);
        return renderPillButton(opt, isSelected, () => {
          let current = [...currentSelections];
          if (isSelected) {
            current = current.filter(val => val !== opt);
          } else {
            current.push(opt);
          }
          handleTempChange(field, current);
        });
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
            <div className="onboarding-form-section">
              <label className="onboarding-label">มีอาการบริเวณไหน?</label>
              {renderMultiSelectPills(INJURY_PARTS, tempConcern.concern_name || [], 'concern_name')}
              {tempConcern.concern_name?.includes('อื่น ๆ') && (
                <input type="text" value={tempConcern.custom_concern_name} onChange={e => handleTempChange('custom_concern_name', e.target.value)} placeholder="ระบุบริเวณ" className={`w-full mb-16 bg-white ${errors.custom_concern_name ? 'input-error' : ''}`} />
              )}
              {errors.concern_name && <div className="validation-message onboarding-error-text" role="alert">{errors.concern_name}</div>}
            </div>

            <div className="onboarding-form-section">
              <label className="onboarding-label">ตอนนี้อาการกระทบการออกกำลังกายแค่ไหน?</label>
              <div className="onboarding-pill-container gap-8">
                {RESTRICTION_LEVELS.map(lvl => renderPillButton(lvl.label, tempConcern.restriction_level === lvl.value, () => handleTempChange('restriction_level', lvl.value)))}
              </div>
              {errors.restriction_level && <div className="validation-message onboarding-error-text" role="alert">{errors.restriction_level}</div>}
            </div>

            <div className="onboarding-form-section">
              <label className="onboarding-label font-normal">มีอะไรที่อยากให้เราระวังเป็นพิเศษไหม? (Optional)</label>
              <textarea value={tempConcern.restriction_note} onChange={e => handleTempChange('restriction_note', e.target.value)} placeholder="เช่น หลีกเลี่ยงการกระโดดหรือใช้แรงกดเข่า" rows="2" className="w-full p-[12px] border border-neutral-300 rounded-xl" />
            </div>
          </>
        )}

        {activeFormType === 'health_condition' && (
          <>
            <div className="onboarding-form-section">
              <label className="onboarding-label">มีภาวะสุขภาพอะไรที่เกี่ยวข้อง?</label>
              <input type="text" value={tempConcern.concern_name} onChange={e => handleTempChange('concern_name', e.target.value)} placeholder="ระบุเฉพาะข้อมูลที่เกี่ยวข้องกับการออกกำลังกาย" className={`w-full bg-white ${errors.concern_name ? 'input-error' : ''}`} />
              {errors.concern_name && <div className="validation-message onboarding-error-text" role="alert">{errors.concern_name}</div>}
            </div>

            <div className="onboarding-form-section">
              <label className="onboarding-label font-normal">มีข้อแนะนำหรือสิ่งที่ควรหลีกเลี่ยงไหม? (Optional)</label>
              <textarea value={tempConcern.restriction_note} onChange={e => handleTempChange('restriction_note', e.target.value)} placeholder="เช่น ควรพักเมื่อมีอาการ หรือหลีกเลี่ยงกิจกรรมบางประเภท" rows="2" className="w-full p-[12px] border border-neutral-300 rounded-xl" />
            </div>

            <div className="onboarding-form-section">
              <label className="onboarding-label">เรื่องนี้กระทบการออกกำลังกายแค่ไหน?</label>
              <div className="onboarding-pill-container gap-8">
                {RESTRICTION_LEVELS.map(lvl => renderPillButton(lvl.label, tempConcern.restriction_level === lvl.value, () => handleTempChange('restriction_level', lvl.value)))}
              </div>
              {errors.restriction_level && <div className="validation-message onboarding-error-text" role="alert">{errors.restriction_level}</div>}
            </div>
          </>
        )}

        {activeFormType === 'medication' && (
          <>
            <div className="onboarding-form-section">
              <label className="onboarding-label">มียาอะไรที่เกี่ยวข้อง?</label>
              <input type="text" value={tempConcern.medication_name} onChange={e => handleTempChange('medication_name', e.target.value)} placeholder="ระบุชื่อยา หากทราบ" className={`w-full bg-white ${errors.medication_name ? 'input-error' : ''}`} />
              {errors.medication_name && <div className="validation-message onboarding-error-text" role="alert">{errors.medication_name}</div>}
            </div>

            <div className="onboarding-form-section">
              <label className="onboarding-label font-normal">มีสิ่งที่ต้องระวังจากยานี้ไหม? (Optional)</label>
              <textarea value={tempConcern.restriction_note} onChange={e => handleTempChange('restriction_note', e.target.value)} placeholder="ระบุเฉพาะข้อมูลที่เกี่ยวข้องกับการออกกำลังกาย" rows="2" className="w-full p-[12px] border border-neutral-300 rounded-xl" />
            </div>
          </>
        )}

        {activeFormType === 'other_restriction' && (
          <div className="onboarding-form-section">
            <label className="onboarding-label">มีอะไรที่ควรหลีกเลี่ยงหรือปรับให้คุณบ้าง?</label>
            {renderMultiSelectPills(OTHER_RESTRICTIONS, tempConcern.concern_name || [], 'concern_name')}
            {tempConcern.concern_name?.includes('อื่น ๆ') && (
              <input type="text" value={tempConcern.custom_concern_name} onChange={e => handleTempChange('custom_concern_name', e.target.value)} placeholder="ระบุสิ่งที่ควรระวัง" style={{ width: '100%', backgroundColor: '#fff' }} className={errors.custom_concern_name ? 'input-error' : ''} />
            )}
            {errors.concern_name && <div className="validation-message onboarding-error-text" role="alert">{errors.concern_name}</div>}
          </div>
        )}

        <hr className="border-none border-t border-brand-200 my-24" />

        {/* Active Status */}
        <div className="onboarding-form-section">
          <label className="onboarding-label">เรื่องนี้ยังมีผลอยู่ตอนนี้ไหม?</label>
          <div className="onboarding-pill-container gap-8">
            {['active', 'intermittent', 'resolved'].map(status => renderPillButton(STATUS_MAPPING[status].label, tempConcern.status === status, () => handleTempChange('status', status)))}
          </div>
        </div>

        {/* Dates */}
        <div className="onboarding-form-section">
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
          {errors.dates && <div className="validation-message onboarding-error-text" role="alert">{errors.dates}</div>}
        </div>

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
      <div className="onboarding-feedback-card onboarding-fade-in mt-24">
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
              <div key={i} style={{ borderBottom: i < concerns.length - 1 ? '1px solid var(--color-neutral-200)' : 'none', paddingBottom: i < concerns.length - 1 ? '16px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-neutral-800)' }}>
                      {typeLabel} {nameStr ? ` — ${nameStr}` : ''}
                    </div>
                    {levelLabel && <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>• {levelLabel}</div>}
                    {c.restriction_note && <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>• {c.restriction_note}</div>}
                    <div style={{ fontSize: '13px', color: 'var(--color-brand-500)', marginTop: '4px' }}>• {STATUS_MAPPING[c.status].label}</div>
                  </div>
                  <button type="button" onClick={() => openForm(c.concern_type, i)} className="bg-transparent border-none text-neutral-500 text-[13px] underline cursor-pointer">แก้ไข</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
            <h2 className="heading-2 mb-8">ก่อนเริ่ม มีอะไรที่เราควรรู้ไหม? 🛡️</h2>
            <p className="body-md text-neutral-600">
              บอกเฉพาะเรื่องที่เกี่ยวข้องกับการออกกำลังกาย เพื่อให้คำแนะนำเหมาะกับคุณมากขึ้น
            </p>
          </div>
        </div>

        <div className="onboarding-privacy-notice">
          <span className="text-lg">🔒</span>
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
                <button
                  key={opt.value}
                  type="button"
                  className={`choice-card ${isSelected ? 'choice-card-selected' : ''}`}
                  style={{ padding: '16px', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', backgroundColor: isSelected ? 'var(--color-brand-50)' : 'var(--color-white)', minHeight: '80px' }}
                  onClick={() => handleMainSelection(opt.value)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginRight: '16px', flexShrink: 0 }}>
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div className="choice-card-label" style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{opt.label}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{opt.desc}</div>
                    </div>
                    {isSelected && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginLeft: '12px', flexShrink: 0 }}>
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inline Form */}
          {renderFormContent()}

          {/* Special states feedbacks */}
          {mainSelection.includes('none') && (
            <div className="onboarding-feedback-card onboarding-fade-in mt-24 bg-success-soft border border-success">
              <p className="m-0 text-success font-semibold flex items-center gap-8">
                <span className="text-[18px]">✅</span> พร้อมแล้ว เราจะใช้ข้อมูลที่มีเพื่อแนะนำจุดเริ่มต้นให้คุณ
              </p>
            </div>
          )}
          {mainSelection.includes('unsure') && (
            <div className="onboarding-feedback-card onboarding-fade-in mt-24">
              <p className="m-0 text-neutral-700 flex items-center gap-8">
                <span className="text-[18px]">ℹ️</span> ไม่เป็นไร คุณกลับมาเพิ่มหรือแก้ไขข้อมูลนี้ใน Profile ได้ภายหลัง
              </p>
            </div>
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
}
