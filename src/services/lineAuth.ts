// LINE account adapter.
//
// With Supabase, the button redirects to real LINE Login (startLineLogin) and
// /auth/line/callback finishes it through the line-auth Edge Function (see
// supabase/functions/line-auth). Offline mode and unit tests keep the simulated
// consent screen below, approving with MOCK_LINE_PROFILE.

const LINE_CHANNEL_ID = import.meta.env?.VITE_LINE_CHANNEL_ID || '2012661380';
const PENDING_KEY = 'lineLoginPending';
export const LINE_CALLBACK_PATH = '/auth/line/callback';

interface PendingLogin { state: string; nonce: string; next: string; redirectUri: string }

const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');

// Leaves the app for LINE's consent screen; LINE sends the member back to LINE_CALLBACK_PATH.
export function startLineLogin(next = '') {
  const pending: PendingLogin = {
    state: randomToken(),
    nonce: randomToken(),
    next,
    redirectUri: new URL(LINE_CALLBACK_PATH, window.location.origin).toString(),
  };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  const url = new URL('https://access.line.me/oauth2/v2.1/authorize');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: LINE_CHANNEL_ID,
    redirect_uri: pending.redirectUri,
    state: pending.state,
    scope: 'profile openid email',
    nonce: pending.nonce,
  }).toString();
  window.location.assign(url.toString());
}

// The login started by startLineLogin, if `state` matches it. Read once: a second call returns null.
export function takePendingLineLogin(state: string | null): PendingLogin | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  sessionStorage.removeItem(PENDING_KEY);
  if (!raw || !state) return null;
  try {
    const pending = JSON.parse(raw) as PendingLogin;
    return pending.state === state ? pending : null;
  } catch {
    return null;
  }
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
}

export const LINE_SCOPES = ['ชื่อที่แสดง', 'รูปโปรไฟล์', 'อีเมล'];

export const MOCK_LINE_PROFILE: LineProfile = {
  userId: 'U0mocklowrox000000000000000000001',
  displayName: 'นักวิ่ง LINE',
  email: 'line.runner@example.com'
};

export async function approveMockLineConsent(): Promise<LineProfile> {
  // Simulates the round trip to LINE and back.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ...MOCK_LINE_PROFILE };
}
