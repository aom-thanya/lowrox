import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getLoginDestination } from '../utils/authRedirect';
import LoadingScreen from '../components/common/LoadingScreen';

// Where LINE Login sends the member back (?code&state, or ?error when they cancel).
export default function LineCallback() {
  useDocumentTitle('กำลังเข้าสู่ระบบ | Lowrox');
  const { completeLineLogin } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [failed, setFailed] = useState<'cancelled' | 'error' | null>(null);
  // LINE's code works once; StrictMode and re-renders must not send it twice.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const code = params.get('code');
    if (!code) {
      setFailed(params.get('error') === 'access_denied' ? 'cancelled' : 'error');
      return;
    }
    completeLineLogin(code, params.get('state'))
      .then(({ user, next }) => {
        const target = next.startsWith('/') && !next.startsWith('//') ? new URL(next, window.location.origin) : null;
        navigate(getLoginDestination(user, target ? { pathname: target.pathname, search: target.search, hash: target.hash } : null), { replace: true });
      })
      .catch(error => {
        console.error('LINE sign-in failed', error);
        setFailed('error');
      });
  }, [params, completeLineLogin, navigate]);

  if (!failed) return <LoadingScreen label="กำลังเข้าสู่ระบบด้วย LINE..." />;

  return (
    <div className="auth-callback">
      <div>
        <h1 className="heading-2">{failed === 'cancelled' ? 'ยกเลิกการเข้าสู่ระบบแล้ว' : 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ'}</h1>
        <p className="field-helper">
          {failed === 'cancelled' ? 'คุณลองเข้าสู่ระบบใหม่ได้ทุกเมื่อ' : 'ลิงก์อาจหมดอายุหรือถูกใช้ไปแล้ว ลองเข้าสู่ระบบอีกครั้ง'}
        </p>
      </div>
      <Link to="/" state={{ login: true }} replace className="btn btn-primary btn-md">เข้าสู่ระบบอีกครั้ง</Link>
    </div>
  );
}
