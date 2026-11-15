import type { User } from '../types/models';
import React from 'react';
import { Link } from 'react-router-dom';
import Image from './common/Image';
import logoImg from '../assets/logo-64.png';
import LineLoginButton from './LineLoginButton';
import EmailLoginForm from './EmailLoginForm';
import { useAuth } from '../context/AuthContext';

// With Supabase the member signs in by email (link or code); offline mode keeps the LINE mock.
// Either way, a first sign-in registers the Lowrox account automatically.
export default function LoginForm({ onSuccess, next }: { onSuccess?: (user: User) => void; next?: string }) {
  const { usesEmailLogin } = useAuth();
  return (
    <div className="login-form-container">
      <div className="login-header">
        <Image src={logoImg} alt="LOWROX" className="login-logo" loading="eager" />
        <h1 className="login-title">เข้าสู่ระบบ</h1>
        <p className="login-subtitle">
          {usesEmailLogin
            ? 'ใช้อีเมลของคุณ ไม่ต้องตั้งรหัสผ่าน ถ้ายังไม่มีบัญชี Lowrox เราจะสร้างให้อัตโนมัติ'
            : 'ใช้บัญชี LINE ของคุณ ถ้ายังไม่มีบัญชี Lowrox เราจะสร้างให้อัตโนมัติ'}
        </p>
      </div>

      {usesEmailLogin
        ? <EmailLoginForm next={next} onSuccess={(user) => onSuccess?.(user)} />
        : <LineLoginButton onSuccess={(user) => onSuccess?.(user)} />}

      <p className="login-terms">
        เมื่อเข้าสู่ระบบ ถือว่าคุณยอมรับ <Link to="/terms">ข้อกำหนดการใช้งาน</Link> และ <Link to="/privacy">นโยบายความเป็นส่วนตัว</Link>
      </p>
    </div>
  );
}
