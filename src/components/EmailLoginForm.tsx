import type { User } from '../types/models';
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './common/Button';
import Input from './common/Input';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Passwordless sign-in through Supabase Auth: we email a link and a 6-digit code.
// The link signs in on any device; the code keeps this modal flow on this device.
// A new email address gets a Lowrox account automatically.
export default function EmailLoginForm({ onSuccess, next = '' }: { onSuccess: (user: User) => void; next?: string }) {
  const { sendEmailLink, verifyEmailCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) { setError('กรุณากรอกอีเมลให้ถูกต้อง'); return; }
    setBusy(true);
    setError('');
    try {
      await sendEmailLink(value, next);
      setSentTo(value);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(/rate|seconds/i.test(message) ? 'ส่งอีเมลถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' : 'ส่งอีเมลไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) { setError('กรอกรหัส 6 หลักจากอีเมล'); return; }
    setBusy(true);
    setError('');
    try {
      onSuccess(await verifyEmailCode(sentTo, code));
    } catch {
      setError('รหัสไม่ถูกต้องหรือหมดอายุแล้ว ลองขอรหัสใหม่');
    } finally {
      setBusy(false);
    }
  };

  if (!sentTo) {
    return (
      <form className="email-login" onSubmit={send} noValidate>
        <label className="field-label" htmlFor="login-email">อีเมล</label>
        <Input id="login-email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com"
          value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} disabled={busy} />
        <Button type="submit" className="w-full" loading={busy}>
          <Mail size={18} aria-hidden="true" /> {busy ? 'กำลังส่ง…' : 'ส่งลิงก์เข้าสู่ระบบ'}
        </Button>
        {error && <p className="line-login-error" role="alert">{error}</p>}
      </form>
    );
  }

  return (
    <form className="email-login" onSubmit={verify} noValidate>
      <p className="field-helper">เราส่งลิงก์และรหัส 6 หลักไปที่ <b>{sentTo}</b> แล้ว กดลิงก์ในอีเมล หรือกรอกรหัสด้านล่าง</p>
      <label className="field-label" htmlFor="login-code">รหัส 6 หลัก</label>
      <Input id="login-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456"
        value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, '')); setError(''); }} disabled={busy} />
      <Button type="submit" className="w-full" loading={busy}>{busy ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}</Button>
      {error && <p className="line-login-error" role="alert">{error}</p>}
      <div className="email-login-actions">
        <button type="button" className="link-button" onClick={() => send()} disabled={busy}>ส่งอีกครั้ง</button>
        <button type="button" className="link-button" onClick={() => { setSentTo(''); setCode(''); setError(''); }} disabled={busy}>เปลี่ยนอีเมล</button>
      </div>
    </form>
  );
}
