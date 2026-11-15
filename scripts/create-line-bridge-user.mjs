// Creates (or resets) the shared account behind the LINE login button.
// Server-side only: uses SUPABASE_SECRET_KEY from .env, never ships to the browser.
// Usage: node scripts/create-line-bridge-user.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

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
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const EMAIL = process.env.VITE_LINE_BRIDGE_EMAIL || 'user01@lowrox.com';
const PASSWORD = process.env.VITE_LINE_BRIDGE_PASSWORD || 'p@ssw0rd1!';

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
});

if (createError) {
  if (!/already.*(registered|exists)/i.test(createError.message)) {
    console.error(`Could not create ${EMAIL}: ${createError.message}`);
    process.exit(1);
  }
  // Account exists — reset its password so the bridge credentials always match.
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error(`Could not list users: ${listError.message}`);
    process.exit(1);
  }
  const existing = list.users.find((u) => u.email === EMAIL);
  if (!existing) {
    console.error(`${EMAIL} reported as existing but was not found`);
    process.exit(1);
  }
  const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
  });
  if (updateError) {
    console.error(`Could not update ${EMAIL}: ${updateError.message}`);
    process.exit(1);
  }
  console.log(`${EMAIL} already existed — password reset and email confirmed.`);
} else {
  console.log(`Created ${EMAIL} (auth uid ${created.user.id}), email confirmed.`);
}

// Verify the bridge sign-in works with the anon key, exactly like the browser will.
const PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const anon = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: session, error: signInError } = await anon.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (signInError) {
  console.error(`Sign-in check failed: ${signInError.message}`);
  console.error('If this says "Email logins are disabled", enable the Email provider (with password) in Supabase Auth settings.');
  process.exit(1);
}
const { data: profile, error: rpcError } = await anon.rpc('ensure_my_profile');
await anon.auth.signOut();
if (rpcError) {
  console.error(`ensure_my_profile failed: ${rpcError.message}`);
  process.exit(1);
}
const row = Array.isArray(profile) ? profile[0] : profile;
console.log(`Sign-in check passed. ms_users id ${row?.id}, username ${row?.username}.`);
