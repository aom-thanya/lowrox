import type { UserId } from '../../types/models';
import { supabase } from '../../lib/supabase';
import { fiveKEquivalent, summarizeLevel, type WorkoutEffort } from '../../utils/leveling';
import type { Workout } from '../workoutRepository';
import type { Connection, ProviderId } from '../deviceRepository';
import { connectionsFromRows, startedAtFromDateKey, workoutFromRow, type DeviceRow, type WorkoutRow } from './mappers';

const fail = (error: { message: string } | null) => { if (error) throw new Error(error.message); };
const byDateDesc = (a: Workout, b: Workout) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

// --- Workouts (txn_workout_summaries + txn_user_history_level) -----------------

export async function fetchWorkouts(userId: UserId): Promise<Workout[]> {
  const { data, error } = await supabase.from('txn_workout_summaries')
    .select('id, started_at, distance_km, duration_sec, source, created_at')
    .eq('user_id', Number(userId))
    .order('started_at', { ascending: false })
    .limit(500);
  fail(error);
  return ((data ?? []) as WorkoutRow[]).map(workoutFromRow).sort(byDateDesc);
}

export async function insertWorkout(input: WorkoutEffort & { date: string }, source: Workout['source']) {
  const level = summarizeLevel(fiveKEquivalent(input)).level.id;
  const { error } = await supabase.rpc('log_workout', {
    p_started_at: startedAtFromDateKey(input.date),
    p_distance_km: input.distanceKm,
    p_duration_min: input.durationMin,
    p_source: source,
    p_fitness_level: level,
  });
  fail(error);
}

export async function removeWorkoutRow(workoutId: string) {
  const { error } = await supabase.from('txn_workout_summaries').delete().eq('id', Number(workoutId));
  fail(error);
}

// --- Weekly plan check-offs (txn_plan_checkoffs) -----------------------------------

export async function fetchPlanDone(userId: UserId, weekStart: string): Promise<string[]> {
  const { data, error } = await supabase.from('txn_plan_checkoffs')
    .select('session_id').eq('user_id', Number(userId)).eq('week_start', weekStart);
  fail(error);
  return (data ?? []).map(row => row.session_id as string);
}

export async function setPlanDoneRow(userId: UserId, weekStart: string, sessionId: string, done: boolean) {
  const query = done
    ? supabase.from('txn_plan_checkoffs').upsert({ user_id: Number(userId), week_start: weekStart, session_id: sessionId })
    : supabase.from('txn_plan_checkoffs').delete().eq('user_id', Number(userId)).eq('week_start', weekStart).eq('session_id', sessionId);
  const { error } = await query;
  fail(error);
}

// --- Devices (ms_device_connections) -----------------------------------------------

export async function fetchConnections(userId: UserId): Promise<Partial<Record<ProviderId, Connection>>> {
  const { data, error } = await supabase.from('ms_device_connections')
    .select('provider, created_at, last_synced_at, import_runs, post_to_party')
    .eq('user_id', Number(userId))
    .eq('connection_status', 'active');
  fail(error);
  return connectionsFromRows((data ?? []) as DeviceRow[]);
}

export async function upsertConnection(userId: UserId, provider: ProviderId) {
  const now = new Date().toISOString();
  const { error } = await supabase.from('ms_device_connections').upsert(
    { user_id: Number(userId), provider, connection_status: 'active', last_synced_at: now, import_runs: true, post_to_party: false, updated_at: now },
    { onConflict: 'user_id,provider' });
  fail(error);
  return fetchConnections(userId);
}

export async function updateConnectionRow(userId: UserId, provider: ProviderId, changes: Partial<Pick<Connection, 'importRuns' | 'postToParty' | 'lastSyncAt'>>) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (changes.importRuns !== undefined) row.import_runs = changes.importRuns;
  if (changes.postToParty !== undefined) row.post_to_party = changes.postToParty;
  if (changes.lastSyncAt !== undefined) row.last_synced_at = changes.lastSyncAt;
  const { error } = await supabase.from('ms_device_connections').update(row).eq('user_id', Number(userId)).eq('provider', provider);
  fail(error);
  return fetchConnections(userId);
}

export async function deleteConnection(userId: UserId, provider: ProviderId) {
  const { error } = await supabase.from('ms_device_connections').delete().eq('user_id', Number(userId)).eq('provider', provider);
  fail(error);
  return fetchConnections(userId);
}
