// A member stays signed in for one year from the moment they signed in, then signs
// in again. Supabase on its own keeps a session alive for as long as the refresh
// token is used (forever, on the Free plan, which has no time-box setting).
//
// The sign-in moment comes from the access token's `amr` claim: Supabase stamps it
// when the member authenticates and carries it unchanged through every hourly
// refresh, so it needs no bookkeeping of our own and survives cleared storage.
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export const SESSION_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

function claims(accessToken: string): Record<string, any> | null {
  try {
    const payload = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=')));
  } catch {
    return null;
  }
}

// When this session began, in ms. Falls back to the user's last sign-in time;
// null when neither is known, and then the session is left alone.
export function sessionStartedAt(session: Pick<Session, 'access_token' | 'user'>): number | null {
  const amr = claims(session.access_token)?.amr;
  const stamps = Array.isArray(amr) ? amr.map(entry => Number(entry?.timestamp)).filter(Number.isFinite) : [];
  if (stamps.length) return Math.min(...stamps) * 1000;
  const last = session.user?.last_sign_in_at ? Date.parse(session.user.last_sign_in_at) : NaN;
  return Number.isFinite(last) ? last : null;
}

export function isSessionExpired(session: Pick<Session, 'access_token' | 'user'>, now = Date.now()): boolean {
  const started = sessionStartedAt(session);
  return started != null && now - started >= SESSION_LIFETIME_MS;
}

// Signs out a session older than a year. Returns true when it did.
export async function enforceSessionLifetime(client: Pick<SupabaseClient, 'auth'>, now = Date.now()): Promise<boolean> {
  const { data } = await client.auth.getSession();
  if (!data.session || !isSessionExpired(data.session, now)) return false;
  await client.auth.signOut();
  return true;
}
