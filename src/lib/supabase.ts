import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  'https://avvxdvvcqexmfpsgtzqm.supabase.co';

const supabasePublishableKey =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)) ||
  'sb_publishable_c2xzUFddrdtoGRinCAna7Q_jeTU3RkE';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export interface HandshakeResult {
  ok: boolean;
  latencyMs: number;
  authHealth: boolean;
  jwks: boolean;
  database: boolean;
  error?: string;
}

export async function checkSupabaseHandshake(): Promise<HandshakeResult> {
  const startTime = Date.now();
  let authHealth = false;
  let jwks = false;
  let database = false;
  let errorMsg: string | undefined;

  try {
    // 1. Auth Health Check
    const authRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabasePublishableKey }
    });
    authHealth = authRes.ok;

    // 2. JWKS Check
    const jwksUrl =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_JWKS_URL) ||
      (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_JWKS_URL || process.env.SUPABASE_JWKS_URL)) ||
      `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

    const jwksRes = await fetch(jwksUrl);
    jwks = jwksRes.ok;

    // 3. Database PostgREST Check
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
    database = !error;
    if (error) {
      errorMsg = error.message;
    }
  } catch (err: any) {
    errorMsg = err?.message || 'Handshake failed';
  }

  const latencyMs = Date.now() - startTime;
  const ok = authHealth && jwks && database;

  return {
    ok,
    latencyMs,
    authHealth,
    jwks,
    database,
    error: ok ? undefined : errorMsg
  };
}
