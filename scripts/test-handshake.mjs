import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load .env if not already in process.env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const SUPABASE_JWKS_URL = process.env.VITE_SUPABASE_JWKS_URL || process.env.SUPABASE_JWKS_URL || `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env or environment.');
  process.exit(1);
}

async function runHandshake() {
  console.log('--- 🚀 SUPABASE HANDSHAKE VERIFICATION ---');
  console.log('Project URL:', SUPABASE_URL);
  console.log('JWKS URL:', SUPABASE_JWKS_URL);
  console.log('Publishable Key prefix:', SUPABASE_PUBLISHABLE_KEY.substring(0, 18) + '...');
  if (SUPABASE_SECRET_KEY) {
    console.log('Secret Key prefix:', SUPABASE_SECRET_KEY.substring(0, 15) + '...\n');
  }

  const results = {
    authHealth: false,
    jwks: false,
    restClientPublishable: false,
    restClientSecret: !SUPABASE_SECRET_KEY, // skip if not provided
  };

  // 1. Check Auth Health
  try {
    const t0 = Date.now();
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    });
    const data = await res.json();
    const latency = Date.now() - t0;
    if (res.ok && data.version) {
      console.log(`✅ [Auth Health]: OK (${latency}ms) - GoTrue version: ${data.version}`);
      results.authHealth = true;
    } else {
      console.error(`❌ [Auth Health] Failed:`, res.status, data);
    }
  } catch (err) {
    console.error(`❌ [Auth Health] Error:`, err.message);
  }

  // 2. Check JWKS endpoint
  try {
    const t0 = Date.now();
    const res = await fetch(SUPABASE_JWKS_URL);
    const data = await res.json();
    const latency = Date.now() - t0;
    if (res.ok && Array.isArray(data.keys) && data.keys.length > 0) {
      console.log(`✅ [JWKS Endpoint]: OK (${latency}ms) - Found ${data.keys.length} key(s) (kid: ${data.keys[0].kid})`);
      results.jwks = true;
    } else {
      console.error(`❌ [JWKS Endpoint] Failed:`, res.status, data);
    }
  } catch (err) {
    console.error(`❌ [JWKS Endpoint] Error:`, err.message);
  }

  // 3. Supabase JS Client (Publishable Key)
  try {
    const t0 = Date.now();
    const supabasePub = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error, count } = await supabasePub
      .from('ms_subscription_plans')
      .select('*', { count: 'exact', head: true });
    const latency = Date.now() - t0;
    if (!error) {
      console.log(`✅ [Supabase Client - Publishable Key]: OK (${latency}ms) - Connected to 'ms_subscription_plans' table (record count: ${count ?? 0})`);
      results.restClientPublishable = true;
    } else {
      console.error(`❌ [Supabase Client - Publishable Key] Query error:`, error);
    }
  } catch (err) {
    console.error(`❌ [Supabase Client - Publishable Key] Error:`, err.message);
  }

  // 4. Supabase JS Client (Secret Key - Admin if provided)
  if (SUPABASE_SECRET_KEY) {
    try {
      const t0 = Date.now();
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data, error } = await supabaseAdmin
        .from('ms_subscription_plans')
        .select('*', { count: 'exact', head: true });
      const latency = Date.now() - t0;
      if (!error) {
        console.log(`✅ [Supabase Client - Secret Key]: OK (${latency}ms) - Admin access verified to 'ms_subscription_plans' table`);
        results.restClientSecret = true;
      } else {
        console.error(`❌ [Supabase Client - Secret Key] Query error:`, error);
      }
    } catch (err) {
      console.error(`❌ [Supabase Client - Secret Key] Error:`, err.message);
    }
  }

  console.log('\n--- 📋 SUMMARY ---');
  const allPassed = Object.values(results).every(Boolean);
  if (allPassed) {
    console.log('🎉 Handshake successful! All services responded normally.');
  } else {
    console.log('⚠️ Handshake completed with some warnings or errors.');
  }

  return allPassed;
}

runHandshake().then(success => {
  process.exit(success ? 0 : 1);
});
