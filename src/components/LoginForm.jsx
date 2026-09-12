import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const newErrors = {};
    if (username.trim() === '') {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    }
    if (password.trim() === '') {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    }
    setErrors(newErrors);
  }, [username, password]);

  const isValid = Object.keys(errors).length === 0 && username !== '' && password !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const result = await login(username, password);
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        setServerError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      setServerError('ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-header">
        <img src={logoImg} alt="LOWROX" className="login-logo" />
        <h1 className="login-title">เข้าสู่ระบบ</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="error-message-area" role="alert" aria-live="assertive">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">ชื่อผู้ใช้</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={errors.username && username ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.username && username && (
            <span className="validation-message" role="alert">{errors.username}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">รหัสผ่าน</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password && password ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>
          {errors.password && password && (
            <span className="validation-message" role="alert">{errors.password}</span>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-cta btn-login w-full" 
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? <span className="loading-spinner">กำลังโหลด...</span> : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
