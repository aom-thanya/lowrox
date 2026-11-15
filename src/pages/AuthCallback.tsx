import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getLoginDestination } from '../utils/authRedirect';
import LoadingScreen from '../components/common/LoadingScreen';

// Where the emailed sign-in link lands. supabase-js reads the session from the URL;
// once the profile is loaded we continue to the page the member came from.
export default function AuthCallback() {
  useDocumentTitle('กำลังเข้าสู่ระบบ | Lowrox');
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get('next') || '';
  const linkError = params.get('error_description') || new URLSearchParams(window.location.hash.slice(1)).get('error_description');

  useEffect(() => {
    if (loading || !user) return;
    const target = next.startsWith('/') && !next.startsWith('//') ? new URL(next, window.location.origin) : null;
    navigate(getLoginDestination(user, target ? { pathname: target.pathname, search: target.search, hash: target.hash } : null), { replace: true });
  }, [loading, user, next, navigate]);

  if (loading || (user && !linkError)) return <LoadingScreen />;

  return (
    <div className="auth-callback">
      <div>
        <h1 className="heading-2">ลิงก์เข้าสู่ระบบใช้ไม่ได้</h1>
        <p className="field-helper">ลิงก์อาจหมดอายุหรือถูกใช้ไปแล้ว ลองขอลิงก์ใหม่อีกครั้ง</p>
      </div>
      <Link to="/" state={{ login: true }} className="btn btn-primary btn-md">ขอลิงก์ใหม่</Link>
    </div>
  );
}
