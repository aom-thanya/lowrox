import { describe, it, expect, vi } from 'vitest';
import { SESSION_LIFETIME_MS, enforceSessionLifetime, isSessionExpired, sessionStartedAt } from '../src/services/supabase/sessionLifetime';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-11-21T00:00:00Z');

// An unsigned JWT with the given claims — only the payload is read.
const b64url = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const token = (claims: object) => `${b64url({ alg: 'none' })}.${b64url(claims)}.sig`;
const session = (signedInMs: number | null, lastSignIn?: string) => ({
  access_token: token(signedInMs == null ? {} : { amr: [{ method: 'otp', timestamp: Math.floor(signedInMs / 1000) }] }),
  user: { last_sign_in_at: lastSignIn } as never,
});

describe('session lifetime', () => {
  it('reads the sign-in moment from the token, not from when it was refreshed', () => {
    expect(sessionStartedAt(session(NOW - 30 * DAY))).toBe(NOW - 30 * DAY);
  });

  it('keeps a session younger than a year', () => {
    expect(isSessionExpired(session(NOW - 364 * DAY), NOW)).toBe(false);
  });

  it('ends a session at one year', () => {
    expect(isSessionExpired(session(NOW - SESSION_LIFETIME_MS), NOW)).toBe(true);
    expect(isSessionExpired(session(NOW - 400 * DAY), NOW)).toBe(true);
  });

  it('falls back to last_sign_in_at when the token has no amr', () => {
    expect(isSessionExpired(session(null, new Date(NOW - 366 * DAY).toISOString()), NOW)).toBe(true);
  });

  it('leaves a session alone when its age is unknown', () => {
    expect(isSessionExpired({ access_token: 'not-a-jwt', user: {} as never }, NOW)).toBe(false);
  });

  it('signs out only an expired session', async () => {
    const client = (s: object | null) => ({ auth: { getSession: async () => ({ data: { session: s } }), signOut: vi.fn() } });
    const old = client(session(NOW - 400 * DAY));
    const fresh = client(session(NOW - 10 * DAY));
    const none = client(null);
    expect(await enforceSessionLifetime(old as never, NOW)).toBe(true);
    expect(old.auth.signOut).toHaveBeenCalledOnce();
    expect(await enforceSessionLifetime(fresh as never, NOW)).toBe(false);
    expect(fresh.auth.signOut).not.toHaveBeenCalled();
    expect(await enforceSessionLifetime(none as never, NOW)).toBe(false);
  });
});
