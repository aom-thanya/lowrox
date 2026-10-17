import type { User } from '../types/models';
import React from 'react';
import { Link } from 'react-router-dom';
import Image from './common/Image';
import logoImg from '../assets/logo-64.png';
import LineLoginButton from './LineLoginButton';

// LINE is the only sign-in method. A LINE account without a Lowrox account is registered automatically.
export default function LoginForm({ onSuccess }: { onSuccess?: (user: User) => void }) {
  return (
    <div className="login-form-container">
      <div className="login-header">
        <Image src={logoImg} alt="LOWROX" className="login-logo" loading="eager" />
        <h1 className="login-title">เข้าสู่ระบบ</h1>
        <p className="login-subtitle">ใช้บัญชี LINE ของคุณ ถ้ายังไม่มีบัญชี Lowrox เราจะสร้างให้อัตโนมัติ</p>
      </div>

      <LineLoginButton onSuccess={(user) => onSuccess?.(user)} />

      <p className="login-terms">
        เมื่อเข้าสู่ระบบ ถือว่าคุณยอมรับ <Link to="/terms">ข้อกำหนดการใช้งาน</Link> และ <Link to="/privacy">นโยบายความเป็นส่วนตัว</Link>
      </p>
    </div>
  );
}
