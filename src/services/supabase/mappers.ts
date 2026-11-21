import type { CommentImage, CommentRecord, EventRecord, OnboardingData, PartyLevel, PartyParticipant, PartyStyle, User } from '../../types/models';
import type { Workout } from '../workoutRepository';
import type { Connection, ProviderId } from '../deviceRepository';

// Pure conversions between the ms_/txn_ rows and the app's models.
// Kept free of network calls so they can be unit-tested.

export interface UserRow {
  id: number;
  username: string;
  email: string;
  tier: string | null;
  display_name: string | null;
  bio: string | null;
  province_id: string | null;
  district_id: string | null;
  avatar_url: string | null;
  onboarding_status: string | null;
  onboarding_data: OnboardingData | null;
  show_profile: boolean | null;
  public_profile_visible: boolean | null;
  public_area_visible: boolean | null;
  interests: string[] | null;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function userFromRow(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    authProvider: 'password',
    tier: row.tier ?? 'free',
    displayName: row.display_name ?? '',
    bio: row.bio ?? '',
    provinceId: row.province_id ?? '',
    districtId: row.district_id ?? '',
    avatarUrl: row.avatar_url ?? '',
    onboardingStatus: row.onboarding_status ?? 'not_started',
    onboardingData: row.onboarding_data ?? undefined,
    showProfile: row.show_profile ?? true,
    publicProfileVisible: row.public_profile_visible ?? true,
    publicAreaVisible: row.public_area_visible ?? true,
    interests: row.interests ?? [],
    deleted_at: row.deleted_at ?? undefined,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  };
}

// Only columns the signed-in member may update (see 04_frontend_integration.sql grants).
const EDITABLE: Record<string, string> = {
  displayName: 'display_name',
  bio: 'bio',
  provinceId: 'province_id',
  districtId: 'district_id',
  avatarUrl: 'avatar_url',
  onboardingStatus: 'onboarding_status',
  showProfile: 'show_profile',
  publicProfileVisible: 'public_profile_visible',
  publicAreaVisible: 'public_area_visible',
  interests: 'interests',
};

export function userChangesToRow(changes: Partial<User>) {
  const row: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(EDITABLE)) {
    const value = (changes as Record<string, unknown>)[key];
    if (value === undefined) continue;
    row[column] = typeof value === 'string' && column !== 'bio' && column !== 'display_name' ? (value || null) : value;
  }
  return row;
}

// --- Events ------------------------------------------------------------------

// The OLTP stores lower-case codes; the UI filters on display values.
const TYPE_FROM_DB: Record<string, string> = {
  running: 'Running', trail: 'Trail', hyrox_prep: 'HYROX', cycling: 'Cycling', badminton: 'Badminton',
  swimming: 'Swimming', functional: 'Functional',
};
const TYPE_TO_DB: Record<string, string> = Object.fromEntries(Object.entries(TYPE_FROM_DB).map(([db, ui]) => [ui, db]));

export const workoutTypeFromDb = (value: string | null) => (value ? TYPE_FROM_DB[value] ?? value : 'Running');
export const workoutTypeToDb = (value: string) => TYPE_TO_DB[value] ?? value.toLowerCase();

const PARTY_LEVELS: PartyLevel[] = ['beginner', 'intermediate', 'advanced', 'elite', 'all'];
export function levelFromDb(value: string | null): PartyLevel | undefined {
  if (!value) return undefined;
  if (value === 'starter') return 'beginner';
  return PARTY_LEVELS.includes(value as PartyLevel) ? value as PartyLevel : undefined;
}

// scheduled/full are both "published" to the UI; full is derived from the seat count.
export function statusFromDb(value: string | null) {
  if (value === 'scheduled' || value === 'full') return 'published';
  return value ?? 'draft';
}

export interface EventRow {
  id: number;
  event_owner: number;
  title: string | null;
  workout_type: string | null;
  scheduled_at: string | null;
  ends_at: string | null;
  location_label: string | null;
  description: string | null;
  target_level: string | null;
  party_style: string | null;
  max_participants: number | null;
  status: string | null;
  visibility: string | null;
  is_party: boolean | null;
  join_url: string | null;
  cover_url: string | null;
  registration_closed: boolean | null;
  deleted_at: string | null;
  ms_area?: { area_label: string | null } | null;
}

export interface PublicUserRow {
  id: number;
  display_name: string | null;
  username?: string | null;
  avatar_url: string | null;
  bio?: string | null;
  province_id?: string | null;
  district_id?: string | null;
  interests?: string[] | null;
  profile_visible?: boolean | null;
  fitness_level?: string | null;
}

export interface ParticipantRow { event_id: number; user_id: number; status: string | null }

export function eventFromRow(row: EventRow, people: Map<number, PublicUserRow>, participants: ParticipantRow[]): EventRecord {
  const host = people.get(row.event_owner);
  const type = workoutTypeFromDb(row.workout_type);
  const location = row.location_label || row.ms_area?.area_label || '';
  const seated: PartyParticipant[] = participants
    .filter(item => item.event_id === row.id && (item.status ?? 'joined') === 'joined')
    .map(item => {
      const person = people.get(item.user_id);
      return { id: item.user_id, name: person?.display_name || 'สมาชิก', levelId: levelFromDb(person?.fitness_level ?? null), avatarUrl: person?.avatar_url || null };
    });
  return {
    id: String(row.id),
    title: row.title || (location ? `${type} · ${location}` : type),
    type,
    date: row.scheduled_at ?? new Date(0).toISOString(),
    endDate: row.ends_at ?? undefined,
    location,
    description: row.description ?? '',
    status: statusFromDb(row.status),
    organizer: { id: row.event_owner, name: host?.display_name || 'สมาชิก', avatarUrl: host?.avatar_url || null },
    hostUserId: row.event_owner,
    visibility: row.visibility ?? 'public',
    joinUrl: row.join_url,
    coverUrl: row.cover_url ?? undefined,
    capacity: row.max_participants ?? undefined,
    participantCount: seated.length,
    registrationClosed: Boolean(row.registration_closed),
    isParty: row.is_party ?? true,
    levelId: levelFromDb(row.target_level),
    style: (row.party_style as PartyStyle | null) ?? undefined,
    participants: seated,
    deleted_at: row.deleted_at ?? undefined,
  };
}

export interface CommentRow { id: number; event_id: number; user_id: number; comment_text: string | null; images: CommentImage[] | null; created_at: string }

export function commentFromRow(row: CommentRow, people: Map<number, PublicUserRow>): CommentRecord {
  const person = people.get(row.user_id);
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    userId: row.user_id,
    userDisplayName: person?.display_name || 'สมาชิก',
    userAvatarUrl: person?.avatar_url || null,
    message: row.comment_text ?? '',
    images: row.images ?? [],
    createdAt: row.created_at,
  };
}

// --- Workouts ----------------------------------------------------------------

export interface WorkoutRow { id: number; started_at: string | null; distance_km: number | string | null; duration_sec: number | null; source: string | null; created_at: string | null }

export const localDateKey = (iso: string) => {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// A logged run has a day, not a time; store it at local noon so time zones never move the day.
export const startedAtFromDateKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`).toISOString();

export function workoutFromRow(row: WorkoutRow): Workout {
  const createdAt = row.created_at ?? row.started_at ?? new Date().toISOString();
  return {
    id: String(row.id),
    date: localDateKey(row.started_at ?? createdAt),
    distanceKm: Number(row.distance_km ?? 0),
    durationMin: (row.duration_sec ?? 0) / 60,
    source: row.source === 'onboarding' ? 'onboarding' : 'log',
    createdAt,
  };
}

// --- Devices -----------------------------------------------------------------

export interface DeviceRow { provider: string; created_at: string | null; last_synced_at: string | null; import_runs: boolean | null; post_to_party: boolean | null }

export function connectionsFromRows(rows: DeviceRow[]): Partial<Record<ProviderId, Connection>> {
  return Object.fromEntries(rows.map(row => [row.provider, {
    provider: row.provider as ProviderId,
    connectedAt: row.created_at ?? new Date().toISOString(),
    lastSyncAt: row.last_synced_at ?? row.created_at ?? new Date().toISOString(),
    importRuns: row.import_runs ?? true,
    postToParty: row.post_to_party ?? false,
  }]));
}
