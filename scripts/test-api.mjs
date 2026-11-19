// Calls every Supabase endpoint the app uses, the way the app calls it, and reports
// which ones pass. Signs in as a dedicated test member (API_TEST_EMAIL) the same way
// LINE Login finishes: a one-time magic-link token from the secret key → verifyOtp.
// Needs SUPABASE_SECRET_KEY. Rows it creates are tagged "[API TEST]" and removed at the end.
// Usage: npm run test:api   (add --verbose to print returned data)
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

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
const TAG = '[API TEST]';

if (!URL || !KEY || !SECRET) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const anon = createClient(URL, KEY, opts);
const db = createClient(URL, KEY, opts);
const admin = createClient(URL, SECRET, opts);

const results = [];
async function step(name, fn) {
  const t0 = Date.now();
  try {
    const out = await fn();
    const { data, error, count } = out ?? {};
    if (error) throw error;
    const ms = Date.now() - t0;
    const info = count != null ? ` (count ${count})` : Array.isArray(data) ? ` (${data.length} rows)` : '';
    console.log(`  ✅ ${name}${info}  ${ms}ms`);
    if (VERBOSE && data !== undefined) console.log('     ', JSON.stringify(data).slice(0, 300));
    results.push({ name, ok: true });
    return data;
  } catch (err) {
    const code = err.code ? `[${err.code}] ` : '';
    console.log(`  ❌ ${name}\n     ${code}${err.message}${err.details ? `\n     details: ${err.details}` : ''}${err.hint ? `\n     hint: ${err.hint}` : ''}`);
    results.push({ name, ok: false, code: err.code, message: err.message });
    return undefined;
  }
}
const skip = (name, why) => { console.log(`  ⏭️  ${name} — skipped (${why})`); results.push({ name, ok: null }); };

// ---------------------------------------------------------------------------
console.log(`Supabase: ${URL}\n\n— Public reads (not signed in)`);
await step('GET ms_subscription_plans', () => anon.from('ms_subscription_plans').select('*', { count: 'exact', head: true }));
await step('GET ms_area', () => anon.from('ms_area').select('*', { count: 'exact', head: true }));
await step('GET txn_events (public list)', () => anon.from('txn_events').select('*, ms_area(area_label)')
  .eq('visibility', 'public').neq('status', 'draft').is('deleted_at', null).order('scheduled_at', { ascending: false }).limit(5));
await step('GET txn_event_participants', () => anon.from('txn_event_participants').select('event_id, user_id, status').limit(5));
await step('GET txn_group_comments', () => anon.from('txn_group_comments').select('id, event_id, user_id, comment_text, images, created_at').limit(5));
await step('GET v_user_public', () => anon.from('v_user_public')
  .select('id, display_name, username, avatar_url, bio, province_id, district_id, interests, profile_visible, fitness_level').limit(5));
await step('RPC create_party as anon (should be denied)', async () => {
  const res = await anon.rpc('create_party', { p_title: TAG, p_workout_type: 'running', p_scheduled_at: new Date().toISOString(),
    p_location: '', p_description: '', p_target_level: 'all', p_party_style: null, p_max_participants: 1 });
  return res.error ? { data: 'denied' } : { error: { message: 'anon was allowed to create a party' } };
});

// ---------------------------------------------------------------------------
console.log(`\n— Auth (${EMAIL})`);
await step('admin: ensure test account', async () => {
  const res = await admin.auth.admin.createUser({ email: EMAIL, email_confirm: true, user_metadata: { display_name: TAG } });
  return res.error && /already.*(registered|exists)/i.test(res.error.message) ? { data: 'exists' } : res;
});
const link = await step('admin: generateLink magiclink', () => admin.auth.admin.generateLink({ type: 'magiclink', email: EMAIL }));
const session = link && await step('POST auth verifyOtp (token_hash)', () =>
  db.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: 'magiclink' }));
if (!session) {
  summary();
  process.exit(1);
}
const authUid = session.user.id;

console.log('\n— Profile');
const profileRows = await step('RPC ensure_my_profile', () => db.rpc('ensure_my_profile'));
const profile = Array.isArray(profileRows) ? profileRows[0] : profileRows;
const uid = profile?.id;
if (!uid) {
  console.log('  ⚠️  no ms_users row → every write below would fail; stopping.');
  summary();
  process.exit(1);
}
console.log(`     ms_users.id = ${uid}`);
await step('PATCH ms_users (display_name unchanged)', () => db.from('ms_users')
  .update({ display_name: profile.display_name, updated_at: new Date().toISOString() }).eq('id', uid).select().single());
await step('RPC save_onboarding (current data, not completing)', () => db.rpc('save_onboarding', {
  p_data: profile.onboarding_data ?? {}, p_complete: false, p_fitness_level: null }));

// ---------------------------------------------------------------------------
console.log('\n— Party');
const future = new Date(Date.now() + 7 * 864e5).toISOString();
const eventId = await step('RPC create_party', () => db.rpc('create_party', {
  p_title: `${TAG} party`, p_workout_type: 'running', p_scheduled_at: future, p_location: `${TAG} location`,
  p_description: TAG, p_target_level: 'all', p_party_style: null, p_max_participants: 5 }));
let commentId;
if (eventId) {
  await step('GET txn_events by id', () => db.from('txn_events').select('*, ms_area(area_label)').eq('id', eventId).single());
  commentId = (await step('POST txn_group_comments', () => db.from('txn_group_comments')
    .insert({ event_id: eventId, user_id: uid, comment_text: TAG, images: [] })
    .select('id, event_id, user_id, comment_text, images, created_at').single()))?.id;
  await step('RPC leave_event', () => db.rpc('leave_event', { p_event_id: eventId }));
  await step('RPC join_event', () => db.rpc('join_event', { p_event_id: eventId }));
  await step('PATCH txn_events (cancel own party)', async () => {
    const res = await db.from('txn_events').update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', eventId).eq('event_owner', uid).select('id, status');
    if (!res.error && !res.data?.length) return { error: { message: '0 rows updated — blocked by RLS (no UPDATE policy?)' } };
    return res;
  });
} else {
  for (const name of ['GET txn_events by id', 'POST txn_group_comments', 'RPC leave_event', 'RPC join_event', 'PATCH txn_events (cancel own party)'])
    skip(name, 'create_party failed');
}

// ---------------------------------------------------------------------------
console.log('\n— Workouts');
await step('GET txn_workout_summaries', () => db.from('txn_workout_summaries')
  .select('id, started_at, distance_km, duration_sec, source, created_at').eq('user_id', uid).limit(5));
const workoutId = await step('RPC log_workout', () => db.rpc('log_workout', {
  p_started_at: new Date().toISOString(), p_distance_km: 0.01, p_duration_min: 1, p_source: 'log', p_fitness_level: null }));
if (workoutId) {
  await step('DELETE txn_workout_summaries', async () => {
    const res = await db.from('txn_workout_summaries').delete().eq('id', workoutId).select('id');
    if (!res.error && !res.data?.length) return { error: { message: '0 rows deleted — blocked by RLS (no DELETE policy?)' } };
    return res;
  });
} else skip('DELETE txn_workout_summaries', 'log_workout failed');

// ---------------------------------------------------------------------------
console.log('\n— Weekly plan');
const weekStart = '2000-01-03';
const sessionId = 'api-test';
await step('GET txn_plan_checkoffs', () => db.from('txn_plan_checkoffs').select('session_id').eq('user_id', uid).eq('week_start', weekStart));
await step('UPSERT txn_plan_checkoffs', () => db.from('txn_plan_checkoffs').upsert({ user_id: uid, week_start: weekStart, session_id: sessionId }));
await step('DELETE txn_plan_checkoffs', () => db.from('txn_plan_checkoffs').delete()
  .eq('user_id', uid).eq('week_start', weekStart).eq('session_id', sessionId));

// ---------------------------------------------------------------------------
console.log('\n— Devices');
const provider = 'polar';
const existing = await step('GET ms_device_connections', () => db.from('ms_device_connections')
  .select('provider, created_at, last_synced_at, import_runs, post_to_party, connection_status').eq('user_id', uid));
const before = existing?.find(row => row.provider === provider);
if (!before) {
  const now = new Date().toISOString();
  await step('UPSERT ms_device_connections', () => db.from('ms_device_connections').upsert(
    { user_id: uid, provider, connection_status: 'active', last_synced_at: now, import_runs: true, post_to_party: false, updated_at: now },
    { onConflict: 'user_id,provider' }));
  await step('PATCH ms_device_connections', () => db.from('ms_device_connections')
    .update({ post_to_party: true, updated_at: now }).eq('user_id', uid).eq('provider', provider));
  await step('DELETE ms_device_connections', () => db.from('ms_device_connections').delete().eq('user_id', uid).eq('provider', provider));
} else {
  skip('UPSERT / DELETE ms_device_connections', `account already has a ${provider} connection`);
  await step('PATCH ms_device_connections (same values)', () => db.from('ms_device_connections')
    .update({ post_to_party: before.post_to_party }).eq('user_id', uid).eq('provider', provider));
}

// ---------------------------------------------------------------------------
console.log('\n— Storage');
// 1×1 transparent PNG
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const avatarPath = `${authUid}/api-test-${Date.now()}.png`;
const uploaded = await step('UPLOAD storage avatars', () => db.storage.from('avatars').upload(avatarPath, png, { contentType: 'image/png' }));
if (uploaded) await step('REMOVE storage avatars', () => db.storage.from('avatars').remove([avatarPath]));
else skip('REMOVE storage avatars', 'upload failed');

// ---------------------------------------------------------------------------
console.log('\n— Cleanup');
{
  if (commentId) await step('admin: delete test comment', () => admin.from('txn_group_comments').delete().eq('id', commentId));
  if (eventId) {
    await step('admin: delete test participants', () => admin.from('txn_event_participants').delete().eq('event_id', eventId));
    await step('admin: delete test party', () => admin.from('txn_events').delete().eq('id', eventId));
  }
  if (workoutId) {
    await step('admin: delete test level history', () => admin.from('txn_user_history_level').delete()
      .eq('user_id', uid).eq('calculation_method', 'manual').eq('running_distance', 0.01));
    await step('admin: delete test workout (if still there)', () => admin.from('txn_workout_summaries').delete().eq('id', workoutId));
  }
}
await db.auth.signOut();

summary();
process.exit(results.some(r => r.ok === false) ? 1 : 0);

function summary() {
  const failed = results.filter(r => r.ok === false);
  const passed = results.filter(r => r.ok === true).length;
  console.log(`\n— Summary: ${passed} passed, ${failed.length} failed, ${results.filter(r => r.ok === null).length} skipped`);
  for (const f of failed) console.log(`  ❌ ${f.name}: ${f.code ? `[${f.code}] ` : ''}${f.message}`);
}
