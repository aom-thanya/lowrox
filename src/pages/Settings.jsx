import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import PageHeader from '../components/common/PageHeader';
import ContentCard from '../components/common/ContentCard';
import Switch from '../components/common/Switch';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import Skeleton from '../components/common/Skeleton';
import Dialog from '../components/common/Dialog';
import { hasSettingsChanges, settingsFromUser } from '../utils/profile';
import { updateCurrentUser } from '../services/userRepository';

export default function Settings() {
  const { user, logout } = useAuth();
  const { setDirty, requestAction } = useUnsavedChanges();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const operation = useRef(0);
  const submitting = useRef(false);
  const changed = hasSettingsChanges(draft, saved);
  const dismissToast = useCallback(() => setToast(''), []);

  useEffect(() => { setDirty(changed); }, [changed, setDirty]);
  useEffect(() => () => { setDirty(false); operation.current += 1; }, [setDirty]);
  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'ตั้งค่าบัญชี | Lowrox';
    return () => { document.title = oldTitle; };
  }, []);

  const load = useCallback(async () => {
    const request = ++operation.current;
    setStatus('loading');
    try {
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      if (request !== operation.current) return;
      
      const settings = settingsFromUser(user);
      setSaved(settings);
      setDraft(settings);
      setStatus('ready');
    } catch { 
      if (request === operation.current) setStatus('error'); 
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const update = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaveError('');
    setToast('');
  };

  const cancel = () => {
    setDraft(saved);
    setSaveError('');
    setToast('');
    setDirty(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || !changed) return;
    submitting.current = true;
    setSaving(true);
    setSaveError('');
    setToast('');

    try {
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUser = updateCurrentUser(user.id, draft);
      const newSettings = settingsFromUser(updatedUser);
      setSaved(newSettings);
      setDraft(newSettings);
      setToast('บันทึกการตั้งค่าแล้ว');
    } catch (err) {
      setSaveError('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    requestAction(() => setShowLogoutConfirm(true));
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <div className="settings-page">
      <PageHeader title="ตั้งค่าบัญชี" description="จัดการบัญชีและการแสดงโปรไฟล์ของคุณ" />

      {status === 'loading' && (
        <div className="profile-skeleton">
          <ContentCard className="settings-card"><Skeleton /></ContentCard>
          <ContentCard className="settings-card"><Skeleton /></ContentCard>
          <ContentCard className="settings-card"><Skeleton /></ContentCard>
        </div>
      )}

      {status === 'error' && (
        <ContentCard className="settings-card load-error">
          <p>โหลดข้อมูลไม่สำเร็จ</p>
          <Button variant="secondary" onClick={load}>ลองอีกครั้ง</Button>
        </ContentCard>
      )}

      {status === 'ready' && draft && (
        <form onSubmit={submit} noValidate className="settings-form">
          <fieldset disabled={saving} className="settings-sections">
            
            <ContentCard className="settings-card">
              <h2 className="heading-4">การเข้าสู่ระบบ</h2>
              <div className="settings-account-field">
                <p className="settings-field-label">วิธีเข้าสู่ระบบ</p>
                <p className="font-medium">{user.username}</p>
              </div>
              {user.email && (
                <div className="settings-account-field">
                  <p className="settings-field-label">อีเมล</p>
                  <p className="font-medium">{user.email}</p>
                  <p className="settings-helper">ข้อมูลนี้จะไม่แสดงในโปรไฟล์สาธารณะ</p>
                </div>
              )}
            </ContentCard>

            <ContentCard className="settings-card">
              <h2 className="heading-4">การแสดงโปรไฟล์</h2>
              <div className="settings-toggle-row">
                <div>
                  <p className="font-medium" id="showProfile-label">แสดงโปรไฟล์ในการหา Buddy</p>
                  <p className="settings-helper">เมื่อปิด สมาชิกคนอื่นจะไม่พบคุณในหน้า Find Buddy แต่ Buddy และแชทเดิมยังใช้งานได้</p>
                </div>
                <div className="settings-toggle-control">
                  <Switch
                    id="showProfile"
                    aria-labelledby="showProfile-label"
                    disabled={saving}
                    checked={draft.showProfile}
                    onChange={(checked) => update('showProfile', checked)}
                  />
                </div>
              </div>

              {saveError && (
                <div className="validation-message error-text mt-4" role="alert">
                  {saveError}
                </div>
              )}
            </ContentCard>

            <ContentCard className="settings-card">
              <h2 className="heading-4">ออกจากระบบ</h2>
              <Button type="button" variant="secondary" onClick={handleLogoutClick}>
                ออกจากระบบ
              </Button>
            </ContentCard>

            <div className="form-actions settings-actions">
              <Button type="button" variant="secondary" onClick={cancel} disabled={!changed || saving}>
                ยกเลิก
              </Button>
              <Button type="submit" variant="primary" disabled={!changed || saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
            </div>
          </fieldset>
        </form>
      )}

      <div className="toast-region" role="status" aria-live="polite">
        {toast && <Toast message={toast} onDismiss={dismissToast} />}
      </div>

      <Dialog open={showLogoutConfirm} title="ออกจากระบบ?" onClose={() => setShowLogoutConfirm(false)}>
        <p>คุณสามารถเข้าสู่ระบบเพื่อกลับมาใช้งานได้ทุกเมื่อ</p>
        {changed && <p className="settings-dialog-warning">การเปลี่ยนแปลงที่ยังไม่บันทึกจะถูกยกเลิก</p>}
        <div className="form-actions settings-dialog-actions">
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)} autoFocus>ยกเลิก</Button>
          <Button variant="primary" onClick={confirmLogout}>ออกจากระบบ</Button>
        </div>
      </Dialog>
    </div>
  );
}
