import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import PageHeader from '../components/common/PageHeader';
import ContentCard from '../components/common/ContentCard';
import FormSection from '../components/common/FormSection';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import ImageUploader from '../components/common/ImageUploader';
import Toast from '../components/common/Toast';
import Skeleton from '../components/common/Skeleton';
import areas from '../data/thaiAreas.json';
import { characterCount, hasProfileChanges, validateProfile } from '../utils/profile';

export default function ProfileEditor() {
  const { user, loadProfile, saveProfile } = useAuth();
  const { setDirty } = useUnsavedChanges();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');
  const [touched, setTouched] = useState({});
  const [imagePending, setImagePending] = useState(false);
  const [uploaderVersion, setUploaderVersion] = useState(0);
  const operation = useRef(0);
  const submitting = useRef(false);
  const changed = hasProfileChanges(draft, saved);
  const errors = draft ? validateProfile(draft, areas) : {};
  const dismissToast = useCallback(() => setToast(''), []);

  useEffect(() => { setDirty(changed || imagePending); }, [changed, imagePending, setDirty]);
  useEffect(() => () => { setDirty(false); operation.current += 1; }, [setDirty]);
  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'ดูและแก้ไขโปรไฟล์ | Lowrox';
    return () => { document.title = oldTitle; };
  }, []);

  const load = useCallback(async () => {
    const request = ++operation.current;
    setStatus('loading');
    try {
      const profile = await loadProfile();
      if (request !== operation.current) return;
      setSaved(profile); setDraft(profile); setStatus('ready');
    } catch { if (request === operation.current) setStatus('error'); }
  }, [loadProfile]);
  useEffect(() => { load(); }, [load]);

  const update = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value, ...(field === 'provinceId' && value !== current.provinceId ? { districtId: '' } : {}) }));
    setTouched((current) => ({ ...current, [field]: true }));
    setSaveError(''); setToast('');
  };
  const cancel = () => {
    setDraft(saved); setTouched({}); setSaveError(''); setToast(''); setImagePending(false);
    setUploaderVersion((current) => current + 1);
    setDirty(false);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || !changed || imagePending || Object.keys(errors).length) return;
    submitting.current = true;
    setSaving(true); setSaveError(''); setToast('');
    const request = ++operation.current;
    try {
      const profile = await saveProfile(draft);
      if (request !== operation.current) return;
      setSaved(profile); setDraft(profile); setTouched({}); setDirty(false);
      setToast('บันทึกโปรไฟล์แล้ว');
    } catch { if (request === operation.current) setSaveError('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'); }
    finally { submitting.current = false; if (request === operation.current) setSaving(false); }
  };
  const fieldProps = (field) => ({
    id: field,
    value: draft[field],
    onChange: (event) => update(field, event.target.value),
    onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
    'aria-invalid': Boolean(touched[field] && errors[field]),
    'aria-describedby': `${field}-help${touched[field] && errors[field] ? ` ${field}-error` : ''}`,
  });

  return <>
    <PageHeader title="ดูและแก้ไขโปรไฟล์" description="ให้ Buddy รู้จักคุณมากขึ้น" />
    {status === 'loading' && <ContentCard><div className="profile-skeleton" role="status" aria-label="กำลังโหลดข้อมูลโปรไฟล์"><Skeleton className="skeleton-avatar" /><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div></ContentCard>}
    {status === 'error' && <ContentCard><div className="load-error"><p role="alert">โหลดข้อมูลไม่สำเร็จ</p><Button onClick={load}>ลองอีกครั้ง</Button></div></ContentCard>}
    {status === 'ready' && draft && <form className="profile-form" onSubmit={submit} noValidate aria-busy={saving}>
      <fieldset disabled={saving}>
        <ContentCard>
          <section aria-labelledby="photo-heading">
            <h2 className="heading-4" id="photo-heading">รูปโปรไฟล์</h2>
            <p className="field-helper section-description">เพิ่มรูปเพื่อให้ Buddy จำคุณได้ง่ายขึ้น</p>
            <ImageUploader key={`${user.id}-${uploaderVersion}`} value={draft.avatarUrl} onChange={(value) => update('avatarUrl', value)} disabled={saving} onPendingChange={setImagePending} />
          </section>
        </ContentCard>
        <ContentCard>
          <section aria-labelledby="personal-heading">
            <h2 className="heading-4" id="personal-heading">ข้อมูลส่วนตัว</h2>
            <p className="field-helper section-description">ข้อมูลส่วนนี้จะแสดงให้สมาชิกคนอื่นเห็นในโปรไฟล์ของคุณ</p>
            <FormSection label="ชื่อที่แสดง *" htmlFor="displayName" helperText="ชื่อที่อยากให้ Buddy เรียก" error={touched.displayName && errors.displayName}>
              <Input {...fieldProps('displayName')} required autoComplete="nickname" />
            </FormSection>
            <FormSection label="แนะนำตัว" htmlFor="bio" error={touched.bio && errors.bio}>
              <Textarea {...fieldProps('bio')} rows={4} placeholder="เช่น ชอบวิ่งตอนเช้า อยากมีเพื่อนไปออกกำลังกายด้วยกัน" aria-describedby={`bio-count${errors.bio ? ' bio-error' : ''}`} />
              <p id="bio-count" className={`character-counter field-helper${errors.bio ? ' field-error' : ''}`}>{characterCount(draft.bio)} / 300 ตัวอักษร</p>
            </FormSection>
            <p className="field-helper area-helper" id="area-help">เลือกพื้นที่ที่คุณสะดวกออกกำลังกาย ไม่ต้องระบุที่อยู่ละเอียด</p>
            <div className="form-grid">
              <FormSection label="จังหวัด" htmlFor="provinceId" error={errors.provinceId}>
                <Select id="provinceId" options={areas} value={draft.provinceId} onChange={(value) => update('provinceId', value)} disabled={saving} placeholder="ค้นหาจังหวัด" aria-describedby="area-help" />
              </FormSection>
              <FormSection label="เขต / อำเภอ" htmlFor="districtId" error={errors.districtId}>
                <Select key={draft.provinceId} id="districtId" options={areas.find((area) => area.value === draft.provinceId)?.districts || []}
                  value={draft.districtId} onChange={(value) => update('districtId', value)} disabled={saving || !draft.provinceId}
                  placeholder={draft.provinceId ? 'ค้นหาเขต / อำเภอ' : 'เลือกจังหวัดก่อน'} aria-describedby="area-help" />
              </FormSection>
            </div>
            <Link className="form-related-link" to="/profile/onboarding">แก้ไขเป้าหมาย ระดับการออกกำลังกาย และความต้องการหา Buddy ผ่านเมนูแก้ไขข้อมูลจาก Onboarding <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </section>
        </ContentCard>
        {saveError && <p className="form-feedback field-error" role="alert">{saveError}</p>}
        <div className="form-actions profile-actions">
          <Button variant="secondary" onClick={cancel} disabled={saving || (!changed && !imagePending)}>ยกเลิก</Button>
          <Button type="submit" disabled={!changed || imagePending || Object.keys(errors).length > 0} loading={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}</Button>
        </div>
      </fieldset>
    </form>}
    <Toast message={toast} onDismiss={dismissToast} />
  </>;
}
