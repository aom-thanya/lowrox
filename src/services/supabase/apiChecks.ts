// Every Supabase call the app makes, as a runnable check. One list, two runners:
//   - scripts/test-api.mjs (npm run test:api) runs all of it as a dedicated test
//     member, with the secret key for setup and cleanup;
//   - the /status page runs the checks that are safe in a browser: public reads,
//     and — when someone is signed in — reads and self-cleaning writes on their
//     own rows.
// tests/apiCoverage.test.ts fails when the app gains a call this list lacks.
//
// No runtime imports on purpose: Node runs this file directly (type stripping),
// so it must not pull in Vite-only modules.
import type { SupabaseClient } from '@supabase/supabase-js';

export type Method = 'GET' | 'POST' | 'PATCH' | 'UPSERT' | 'DELETE' | 'RPC' | 'UPLOAD' | 'REMOVE';
export type Crud = 'C' | 'R' | 'U' | 'D';
// anon:         no session needed
// member:       any signed-in member; reads, or writes that undo themselves
// test-account: writes only the secret key can clean up — CLI on the test member only
export type Needs = 'anon' | 'member' | 'test-account';
export type Status = 'pass' | 'fail' | 'skip';

export interface CheckContext {
  anon: SupabaseClient;
  db: SupabaseClient | null;       // signed in as a member
  admin: SupabaseClient | null;    // secret key; CLI only
  state: Record<string, any>;      // values one check hands to the next
}

type Outcome = { data?: unknown; error?: { message: string; code?: string } | null; count?: number | null } | void;

export interface ApiCheck {
  id: string;
  group: string;
  method: Method;
  target: string;                  // table, view, function or bucket
  crud: Crud;
  needs: Needs;
  label: string;
  expect?: 'denied';               // a check that passes when RLS refuses it
  requires?: string[];             // state keys an earlier check must have set
  run: (ctx: CheckContext) => PromiseLike<Outcome>;
  keep?: (ctx: CheckContext, data: any) => void;
}

export interface CheckResult {
  id: string;
  status: Status;
  ms: number;
  rows?: number;
  error?: string;
  reason?: string;
}

export const TAG = '[API TEST]';
const PARTY_COLS = '*, ms_area(area_label)';
const COMMENT_COLS = 'id, event_id, user_id, comment_text, images, created_at';
const PUBLIC_USER_COLS = 'id, display_name, username, avatar_url, bio, province_id, district_id, interests, profile_visible, fitness_level';
const DEVICE_COLS = 'provider, created_at, last_synced_at, import_runs, post_to_party, connection_status';
const PLAN_WEEK = '2000-01-03';    // a week no real member has
const PLAN_SESSION = 'api-test';
const PROVIDER = 'polar';

// 1×1 images. Storage checks the declared type against the bucket's allowed list.
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const JPEG = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const bytes = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

const nowIso = () => new Date().toISOString();
const member = (ctx: CheckContext) => ctx.db as SupabaseClient;
const admin = (ctx: CheckContext) => ctx.admin as SupabaseClient;
// An UPDATE or DELETE that RLS blocks returns no error and no rows. Say so.
const mustTouch = (verb: string) => (res: { data: unknown[] | null; error: any }) =>
  !res.error && !res.data?.length ? { error: { message: `0 rows ${verb} — blocked by RLS?` } } : res;
const denied = (res: { error: any; data?: any }) =>
  res.error ? { data: 'denied' } : { error: { message: 'allowed — RLS should have refused this' } };

export const API_CHECKS: ApiCheck[] = [
  // ---------------------------------------------------------------- public
  { id: 'plans.read', group: 'Public', method: 'GET', target: 'ms_subscription_plans', crud: 'R', needs: 'anon',
    label: 'Subscription plans',
    run: c => c.anon.from('ms_subscription_plans').select('*', { count: 'exact', head: true }) },
  { id: 'area.read', group: 'Public', method: 'GET', target: 'ms_area', crud: 'R', needs: 'anon',
    label: 'Areas',
    run: c => c.anon.from('ms_area').select('*', { count: 'exact', head: true }) },
  { id: 'events.list', group: 'Public', method: 'GET', target: 'txn_events', crud: 'R', needs: 'anon',
    label: 'Public party list',
    run: c => c.anon.from('txn_events').select(PARTY_COLS).eq('visibility', 'public').neq('status', 'draft')
      .is('deleted_at', null).order('scheduled_at', { ascending: false }).limit(5) },
  { id: 'participants.read', group: 'Public', method: 'GET', target: 'txn_event_participants', crud: 'R', needs: 'anon',
    label: 'Party participants',
    run: c => c.anon.from('txn_event_participants').select('event_id, user_id, status').limit(5) },
  { id: 'comments.read', group: 'Public', method: 'GET', target: 'txn_group_comments', crud: 'R', needs: 'anon',
    label: 'Party comments',
    run: c => c.anon.from('txn_group_comments').select(COMMENT_COLS).limit(5) },
  { id: 'people.read', group: 'Public', method: 'GET', target: 'v_user_public', crud: 'R', needs: 'anon',
    label: 'Public profiles',
    run: c => c.anon.from('v_user_public').select(PUBLIC_USER_COLS).limit(5) },
  { id: 'rls.anon-party', group: 'Public', method: 'RPC', target: 'create_party', crud: 'C', needs: 'anon', expect: 'denied',
    label: 'Anon cannot create a party',
    run: async c => denied(await c.anon.rpc('create_party', { p_title: TAG, p_workout_type: 'running',
      p_scheduled_at: nowIso(), p_location: '', p_description: '', p_target_level: 'all', p_party_style: null, p_max_participants: 1 })) },
  { id: 'rls.anon-workout', group: 'Public', method: 'POST', target: 'txn_workout_summaries', crud: 'C', needs: 'anon', expect: 'denied',
    label: 'Anon cannot write a workout',
    run: async c => denied(await c.anon.from('txn_workout_summaries').insert({ user_id: 1, distance_km: 1, duration_sec: 600 })) },
  { id: 'rls.anon-users', group: 'Public', method: 'GET', target: 'ms_users', crud: 'R', needs: 'anon', expect: 'denied',
    label: 'Anon cannot read member records',
    run: async c => {
      const res = await c.anon.from('ms_users').select('id').limit(1);
      return res.error || !res.data?.length ? { data: 'denied' } : { error: { message: `anon read ${res.data.length} ms_users row(s)` } };
    } },

  // --------------------------------------------------------------- profile
  { id: 'profile.ensure', group: 'Profile', method: 'RPC', target: 'ensure_my_profile', crud: 'R', needs: 'member',
    label: 'Load my profile',
    run: c => member(c).rpc('ensure_my_profile'),
    keep: (c, data) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.id) { c.state.uid = row.id; c.state.profile = row; }
    } },
  { id: 'profile.update', group: 'Profile', method: 'PATCH', target: 'ms_users', crud: 'U', needs: 'member', requires: ['uid'],
    label: 'Update my profile (same values)',
    run: c => member(c).from('ms_users').update({ display_name: c.state.profile.display_name, updated_at: nowIso() })
      .eq('id', c.state.uid).select().single() },
  { id: 'profile.onboarding', group: 'Profile', method: 'RPC', target: 'save_onboarding', crud: 'U', needs: 'test-account', requires: ['uid'],
    label: 'Save onboarding',
    run: c => member(c).rpc('save_onboarding', { p_data: c.state.profile.onboarding_data ?? {}, p_complete: false, p_fitness_level: null }) },

  // ----------------------------------------------------------------- party
  { id: 'party.create', group: 'Party', method: 'RPC', target: 'create_party', crud: 'C', needs: 'test-account', requires: ['uid'],
    label: 'Create a party',
    run: c => member(c).rpc('create_party', { p_title: `${TAG} party`, p_workout_type: 'running',
      p_scheduled_at: new Date(Date.now() + 7 * 864e5).toISOString(), p_location: `${TAG} location`,
      p_description: TAG, p_target_level: 'all', p_party_style: null, p_max_participants: 5 }),
    keep: (c, id) => { if (id) c.state.eventId = id; } },
  { id: 'party.read', group: 'Party', method: 'GET', target: 'txn_events', crud: 'R', needs: 'test-account', requires: ['eventId'],
    label: 'Read the party back',
    run: c => member(c).from('txn_events').select(PARTY_COLS).eq('id', c.state.eventId).single() },
  { id: 'party.hosted', group: 'Party', method: 'GET', target: 'txn_events', crud: 'R', needs: 'member', requires: ['uid'],
    label: 'Parties I host',
    run: c => member(c).from('txn_events').select(PARTY_COLS).eq('event_owner', c.state.uid).is('deleted_at', null).limit(5) },
  { id: 'comment.create', group: 'Party', method: 'POST', target: 'txn_group_comments', crud: 'C', needs: 'test-account', requires: ['eventId'],
    label: 'Post a comment',
    run: c => member(c).from('txn_group_comments').insert({ event_id: c.state.eventId, user_id: c.state.uid, comment_text: TAG, images: [] })
      .select(COMMENT_COLS).single(),
    keep: (c, row) => { if (row?.id) c.state.commentId = row.id; } },
  { id: 'party.leave', group: 'Party', method: 'RPC', target: 'leave_event', crud: 'D', needs: 'test-account', requires: ['eventId'],
    label: 'Leave the party',
    run: c => member(c).rpc('leave_event', { p_event_id: c.state.eventId }) },
  { id: 'party.join', group: 'Party', method: 'RPC', target: 'join_event', crud: 'C', needs: 'test-account', requires: ['eventId'],
    label: 'Join the party',
    run: c => member(c).rpc('join_event', { p_event_id: c.state.eventId }) },
  { id: 'party.cancel', group: 'Party', method: 'PATCH', target: 'txn_events', crud: 'U', needs: 'test-account', requires: ['eventId'],
    label: 'Cancel my party',
    run: async c => mustTouch('updated')(await member(c).from('txn_events').update({ status: 'cancelled', updated_at: nowIso() })
      .eq('id', c.state.eventId).eq('event_owner', c.state.uid).select('id, status')) },

  // -------------------------------------------------------------- workouts
  { id: 'workout.list', group: 'Workouts', method: 'GET', target: 'txn_workout_summaries', crud: 'R', needs: 'member', requires: ['uid'],
    label: 'My workouts',
    run: c => member(c).from('txn_workout_summaries').select('id, started_at, distance_km, duration_sec, source, created_at')
      .eq('user_id', c.state.uid).limit(5) },
  { id: 'workout.log', group: 'Workouts', method: 'RPC', target: 'log_workout', crud: 'C', needs: 'test-account', requires: ['uid'],
    label: 'Log a workout',
    run: c => member(c).rpc('log_workout', { p_started_at: nowIso(), p_distance_km: 0.01, p_duration_min: 1, p_source: 'log', p_fitness_level: null }),
    keep: (c, id) => { if (id) c.state.workoutId = id; } },
  { id: 'workout.delete', group: 'Workouts', method: 'DELETE', target: 'txn_workout_summaries', crud: 'D', needs: 'test-account', requires: ['workoutId'],
    label: 'Delete the workout',
    run: async c => mustTouch('deleted')(await member(c).from('txn_workout_summaries').delete().eq('id', c.state.workoutId).select('id')) },

  // ----------------------------------------------------------- weekly plan
  { id: 'plan.read', group: 'Weekly plan', method: 'GET', target: 'txn_plan_checkoffs', crud: 'R', needs: 'member', requires: ['uid'],
    label: 'Plan check-offs',
    run: c => member(c).from('txn_plan_checkoffs').select('session_id').eq('user_id', c.state.uid).eq('week_start', PLAN_WEEK) },
  { id: 'plan.tick', group: 'Weekly plan', method: 'UPSERT', target: 'txn_plan_checkoffs', crud: 'C', needs: 'member', requires: ['uid'],
    label: 'Tick a session (year-2000 week)',
    run: c => member(c).from('txn_plan_checkoffs').upsert({ user_id: c.state.uid, week_start: PLAN_WEEK, session_id: PLAN_SESSION }) },
  { id: 'plan.untick', group: 'Weekly plan', method: 'DELETE', target: 'txn_plan_checkoffs', crud: 'D', needs: 'member', requires: ['uid'],
    label: 'Untick it',
    run: async c => mustTouch('deleted')(await member(c).from('txn_plan_checkoffs').delete()
      .eq('user_id', c.state.uid).eq('week_start', PLAN_WEEK).eq('session_id', PLAN_SESSION).select('session_id')) },

  // --------------------------------------------------------------- devices
  { id: 'device.list', group: 'Devices', method: 'GET', target: 'ms_device_connections', crud: 'R', needs: 'member', requires: ['uid'],
    label: 'My device connections',
    run: c => member(c).from('ms_device_connections').select(DEVICE_COLS).eq('user_id', c.state.uid),
    // Only exercise create/delete on a provider the member has not connected.
    keep: (c, rows) => { if (Array.isArray(rows) && !rows.some(r => r.provider === PROVIDER)) c.state.deviceFree = true; } },
  { id: 'device.connect', group: 'Devices', method: 'UPSERT', target: 'ms_device_connections', crud: 'C', needs: 'member', requires: ['deviceFree'],
    label: `Connect ${PROVIDER}`,
    run: c => member(c).from('ms_device_connections').upsert({ user_id: c.state.uid, provider: PROVIDER, connection_status: 'active',
      last_synced_at: nowIso(), import_runs: true, post_to_party: false, updated_at: nowIso() }, { onConflict: 'user_id,provider' }) },
  { id: 'device.update', group: 'Devices', method: 'PATCH', target: 'ms_device_connections', crud: 'U', needs: 'member', requires: ['deviceFree'],
    label: `Change ${PROVIDER} settings`,
    run: async c => mustTouch('updated')(await member(c).from('ms_device_connections').update({ post_to_party: true, updated_at: nowIso() })
      .eq('user_id', c.state.uid).eq('provider', PROVIDER).select('provider')) },
  { id: 'device.disconnect', group: 'Devices', method: 'DELETE', target: 'ms_device_connections', crud: 'D', needs: 'member', requires: ['deviceFree'],
    label: `Disconnect ${PROVIDER}`,
    run: async c => mustTouch('deleted')(await member(c).from('ms_device_connections').delete()
      .eq('user_id', c.state.uid).eq('provider', PROVIDER).select('provider')) },

  // --------------------------------------------------------------- storage
  ...(['avatars', 'comment-images'] as const).flatMap((bucket): ApiCheck[] => {
    const [type, data, ext] = bucket === 'avatars' ? ['image/png', PNG, 'png'] : ['image/jpeg', JPEG, 'jpg'];
    return [
      { id: `storage.${bucket}.upload`, group: 'Storage', method: 'UPLOAD', target: bucket, crud: 'C', needs: 'member',
        label: `Upload to ${bucket}`,
        run: async c => {
          const { data: auth } = await member(c).auth.getUser();
          const path = `${auth.user?.id}/api-test-${Date.now()}.${ext}`;
          c.state[`path:${bucket}`] = path;
          return member(c).storage.from(bucket).upload(path, bytes(data), { contentType: type });
        } },
      { id: `storage.${bucket}.remove`, group: 'Storage', method: 'REMOVE', target: bucket, crud: 'D', needs: 'member',
        requires: [`path:${bucket}`], label: `Remove from ${bucket}`,
        // remove() reports what it deleted. An empty list means RLS hid the file and
        // it is still there — storage needs a SELECT policy as well as DELETE.
        run: async c => {
          const res = await member(c).storage.from(bucket).remove([c.state[`path:${bucket}`]]);
          if (!res.error && !res.data?.length) return { error: { message: '0 files removed — still in the bucket (no SELECT policy on storage.objects?)' } };
          return res;
        } },
    ];
  }),
];

// Rows the test member created that its own session cannot delete.
export const CLEANUP_CHECKS: ApiCheck[] = [
  { id: 'cleanup.comment', group: 'Cleanup', method: 'DELETE', target: 'txn_group_comments', crud: 'D', needs: 'test-account', requires: ['commentId'],
    label: 'admin: delete test comment', run: c => admin(c).from('txn_group_comments').delete().eq('id', c.state.commentId) },
  { id: 'cleanup.participants', group: 'Cleanup', method: 'DELETE', target: 'txn_event_participants', crud: 'D', needs: 'test-account', requires: ['eventId'],
    label: 'admin: delete test participants', run: c => admin(c).from('txn_event_participants').delete().eq('event_id', c.state.eventId) },
  { id: 'cleanup.party', group: 'Cleanup', method: 'DELETE', target: 'txn_events', crud: 'D', needs: 'test-account', requires: ['eventId'],
    label: 'admin: delete test party', run: c => admin(c).from('txn_events').delete().eq('id', c.state.eventId) },
  { id: 'cleanup.level', group: 'Cleanup', method: 'DELETE', target: 'txn_user_history_level', crud: 'D', needs: 'test-account', requires: ['workoutId'],
    label: 'admin: delete test level history', run: c => admin(c).from('txn_user_history_level').delete()
      .eq('user_id', c.state.uid).eq('calculation_method', 'manual').eq('running_distance', 0.01) },
  { id: 'cleanup.workout', group: 'Cleanup', method: 'DELETE', target: 'txn_workout_summaries', crud: 'D', needs: 'test-account', requires: ['workoutId'],
    label: 'admin: delete test workout (if still there)', run: c => admin(c).from('txn_workout_summaries').delete().eq('id', c.state.workoutId) },
  ...(['avatars', 'comment-images'] as const).map((bucket): ApiCheck => (
    { id: `cleanup.${bucket}`, group: 'Cleanup', method: 'REMOVE', target: bucket, crud: 'D', needs: 'test-account', requires: [`path:${bucket}`],
      label: `admin: remove test file from ${bucket}`,
      run: c => admin(c).storage.from(bucket).remove([c.state[`path:${bucket}`]]) })),
];

const why = (check: ApiCheck, ctx: CheckContext, allowed: Needs[]): string | null => {
  if (!allowed.includes(check.needs)) return check.needs === 'test-account'
    ? 'test account only — npm run test:api' : 'sign in to run';
  if (check.needs !== 'anon' && !ctx.db) return 'sign in to run';
  const missing = check.requires?.filter(key => ctx.state[key] == null);
  if (missing?.length) return `needs ${missing.join(', ')} from an earlier check`;
  return null;
};

// Runs in order, because later checks use what earlier ones created.
export async function runChecks(checks: ApiCheck[], ctx: CheckContext, allowed: Needs[],
  onResult?: (check: ApiCheck, result: CheckResult) => void): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const check of checks) {
    const reason = why(check, ctx, allowed);
    let result: CheckResult;
    if (reason) {
      result = { id: check.id, status: 'skip', ms: 0, reason };
    } else {
      const t0 = Date.now();
      try {
        const out = (await check.run(ctx)) ?? {};
        if (out.error) throw out.error;
        check.keep?.(ctx, out.data);
        const rows = out.count ?? (Array.isArray(out.data) ? out.data.length : undefined);
        result = { id: check.id, status: 'pass', ms: Date.now() - t0, rows };
      } catch (err: any) {
        const code = err?.code ? `[${err.code}] ` : '';
        result = { id: check.id, status: 'fail', ms: Date.now() - t0, error: `${code}${err?.message ?? String(err)}` };
      }
    }
    results.push(result);
    onResult?.(check, result);
  }
  return results;
}
