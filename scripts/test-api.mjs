// Calls every Supabase endpoint the app uses, the way the app calls it, and reports
// which ones pass. The checks live in src/services/supabase/apiChecks.ts, shared
// with the /status page. Signs in as a dedicated test member (API_TEST_EMAIL) the
// same way LINE Login finishes: a one-time magic-link token from the secret key →
// verifyOtp. Needs SUPABASE_SECRET_KEY. Rows it creates are tagged "[API TEST]" and
// removed at the end.
// Usage: npm run test:api            (add --verbose to print errors in full,
//                                     --json <file> to save the results)
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { API_CHECKS, CLEANUP_CHECKS, TAG, runChecks } from '../src/services/supabase/apiChecks.ts';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(idx + 1).trim();
  }
}
loadEnv();

const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const EMAIL = process.env.API_TEST_EMAIL || 'api-test@line.lowrox.app';
const VERBOSE = process.argv.includes('--verbose');
const jsonAt = process.argv.indexOf('--json');
const JSON_OUT = jsonAt > -1 ? process.argv[jsonAt + 1] : null;

if (!URL || !KEY || !SECRET) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const ctx = {
  anon: createClient(URL, KEY, opts),
  db: createClient(URL, KEY, opts),
  admin: createClient(URL, SECRET, opts),
  state: {},
};
const all = [];
let group = '';

function print(check, r) {
  if (check.group !== group) console.log(`\n— ${(group = check.group)}`);
  const name = `${check.method} ${check.target} — ${check.label}`;
  if (r.status === 'pass') console.log(`  ✅ ${name}${r.rows != null ? ` (${r.rows} rows)` : ''}  ${r.ms}ms`);
  else if (r.status === 'skip') console.log(`  ⏭️  ${name} — skipped (${r.reason})`);
  else console.log(`  ❌ ${name}\n     ${VERBOSE ? r.error : r.error?.slice(0, 200)}`);
  all.push({ ...r, method: check.method, target: check.target, crud: check.crud, label: check.label, group: check.group });
}

// Sign in the test member — setup, not one of the app's calls.
async function signIn() {
  console.log(`Supabase: ${URL}\n\n— Auth (${EMAIL})`);
  const created = await ctx.admin.auth.admin.createUser({ email: EMAIL, email_confirm: true, user_metadata: { display_name: TAG } });
  if (created.error && !/already.*(registered|exists)/i.test(created.error.message)) return created.error;
  const link = await ctx.admin.auth.admin.generateLink({ type: 'magiclink', email: EMAIL });
  if (link.error) return link.error;
  const otp = await ctx.db.auth.verifyOtp({ token_hash: link.data.properties.hashed_token, type: 'magiclink' });
  if (otp.error) return otp.error;
  console.log('  ✅ signed in');
  return null;
}

const authError = await signIn();
if (authError) {
  console.log(`  ❌ sign-in failed: ${authError.message}\n     member checks will be skipped`);
  ctx.db = null;
}
const everything = ['anon', 'member', 'test-account'];
await runChecks(API_CHECKS, ctx, everything, print);
if (ctx.db && !ctx.state.uid) console.log('  ⚠️  no ms_users row — every write was skipped');
await runChecks(CLEANUP_CHECKS, ctx, everything, print);
await ctx.db?.auth.signOut();

const failed = all.filter(r => r.status === 'fail');
const passed = all.filter(r => r.status === 'pass').length;
const skipped = all.filter(r => r.status === 'skip').length;
console.log(`\n— Summary: ${passed} passed, ${failed.length} failed, ${skipped} skipped`);
for (const f of failed) console.log(`  ❌ ${f.method} ${f.target} — ${f.label}: ${f.error}`);
if (JSON_OUT) {
  fs.writeFileSync(JSON_OUT, JSON.stringify({ ranAt: new Date().toISOString(), supabaseUrl: URL, results: all }, null, 2));
  console.log(`\nSaved ${JSON_OUT}`);
}
process.exit(failed.length || authError ? 1 : 0);
