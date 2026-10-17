import type { User } from '../types/models';
import React, { useState } from 'react';
import { Check, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { approveMockLineConsent, LINE_SCOPES, MOCK_LINE_PROFILE } from '../services/lineAuth';
import Dialog from './common/Dialog';
import Button from './common/Button';

// Sign in with LINE. A LINE account with no Lowrox user yet is registered automatically (isNew = true).
// The consent step is simulated until real LINE Login is wired up (see services/lineAuth.ts).
export default function LineLoginButton({ onSuccess, className = '' }: { onSuccess: (user: User, isNew: boolean) => void; className?: string }) {
  const { loginWithLine } = useAuth();
  const [consentOpen, setConsentOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const approve = async () => {
    setBusy(true);
    setError('');
    try {
      const profile = await approveMockLineConsent();
      const { user, isNew } = await loginWithLine(profile);
      setBusy(false);
      setConsentOpen(false);
      onSuccess(user, isNew);
    } catch {
      setBusy(false);
      setError('เชื่อมต่อ LINE ไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  const cancel = () => {
    if (busy) return;
    setConsentOpen(false);
    setError('ยกเลิกการเชื่อมต่อ LINE แล้ว คุณลองใหม่ได้ทุกเมื่อ');
  };

  return (
    <div className={`line-login ${className}`}>
      <button type="button" className="btn btn-md btn-line w-full" onClick={() => { setError(''); setConsentOpen(true); }}>
        <MessageCircle size={20} fill="currentColor" aria-hidden="true" />
        เข้าสู่ระบบด้วย LINE
      </button>
      {error && <p className="line-login-error" role="alert">{error}</p>}

      <Dialog open={consentOpen} title="เชื่อมต่อบัญชี LINE" onClose={cancel}>
        <p className="line-consent-mock">โหมดจำลอง: ยังไม่ได้เชื่อมต่อกับ LINE จริง</p>
        <div className="line-consent-account">
          <span className="line-consent-avatar" aria-hidden="true">{MOCK_LINE_PROFILE.displayName.charAt(0)}</span>
          <div>
            <strong>{MOCK_LINE_PROFILE.displayName}</strong>
            <span>{MOCK_LINE_PROFILE.email}</span>
          </div>
        </div>
        <div>
          <p className="line-consent-heading">Lowrox ขอเข้าถึงข้อมูลจากบัญชี LINE ของคุณ</p>
          <ul className="line-consent-scopes">
            {LINE_SCOPES.map(scope => <li key={scope}><Check size={16} aria-hidden="true" />{scope}</li>)}
          </ul>
          <p className="field-helper">เราไม่โพสต์หรือส่งข้อความใด ๆ ใน LINE ของคุณ</p>
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={cancel} disabled={busy}>ยกเลิก</Button>
          <Button className="btn-line" onClick={approve} loading={busy}>{busy ? 'กำลังเชื่อมต่อ…' : 'อนุญาต'}</Button>
        </div>
      </Dialog>
    </div>
  );
}
