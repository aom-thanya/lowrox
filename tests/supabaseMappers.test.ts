import { describe, expect, it } from 'vitest';
import {
  connectionsFromRows, eventFromRow, levelFromDb, localDateKey, startedAtFromDateKey, statusFromDb,
  userChangesToRow, userFromRow, workoutFromRow, workoutTypeFromDb, workoutTypeToDb,
  type EventRow, type PublicUserRow,
} from '../src/services/supabase/mappers';
import { isPublicEvent, eventStatusLabel } from '../src/utils/eventVisibility';

const eventRow = (overrides: Partial<EventRow> = {}): EventRow => ({
  id: 7, event_owner: 13, title: null, workout_type: 'running', scheduled_at: '2999-01-01T06:00:00+07:00', ends_at: null,
  location_label: null, description: null, target_level: 'starter', party_style: null, max_participants: 2,
  status: 'scheduled', visibility: 'public', is_party: true, join_url: null, cover_url: null,
  registration_closed: false, deleted_at: null, ms_area: { area_label: 'Lumphini Park' }, ...overrides,
});

const people = new Map<number, PublicUserRow>([
  [13, { id: 13, display_name: 'Host', avatar_url: null, fitness_level: 'advanced' }],
  [20, { id: 20, display_name: 'Guest', avatar_url: 'a.png', fitness_level: null }],
]);

describe('Supabase row mapping', () => {
  it('maps a seeded event to something the event pages can show', () => {
    const event = eventFromRow(eventRow(), people, [
      { event_id: 7, user_id: 13, status: 'joined' },
      { event_id: 7, user_id: 20, status: 'joined' },
      { event_id: 7, user_id: 99, status: 'cancelled' },
      { event_id: 8, user_id: 20, status: 'joined' },
    ]);
    expect(event).toMatchObject({
      id: '7', type: 'Running', title: 'Running · Lumphini Park', location: 'Lumphini Park', status: 'published',
      levelId: 'beginner', capacity: 2, participantCount: 2, isParty: true, hostUserId: 13,
      organizer: { id: 13, name: 'Host', avatarUrl: null },
    });
    expect(event.participants).toEqual([
      { id: 13, name: 'Host', levelId: 'advanced' },
      { id: 20, name: 'Guest', levelId: undefined },
    ]);
    expect(isPublicEvent(event)).toBe(true);
    expect(eventStatusLabel(event, new Date('2026-01-01').getTime())).toBe('เต็มแล้ว');
  });

  it('keeps app-made titles and hides drafts', () => {
    expect(eventFromRow(eventRow({ title: 'Easy run', location_label: 'สวนลุม' }), people, []).title).toBe('Easy run');
    expect(isPublicEvent(eventFromRow(eventRow({ status: 'draft' }), people, []))).toBe(false);
  });

  it('converts workout types, levels and statuses both ways', () => {
    expect(workoutTypeFromDb('hyrox_prep')).toBe('HYROX');
    expect(workoutTypeToDb('HYROX')).toBe('hyrox_prep');
    expect(workoutTypeToDb('Running')).toBe('running');
    expect(levelFromDb('starter')).toBe('beginner');
    expect(levelFromDb('unknown')).toBeUndefined();
    expect(statusFromDb('full')).toBe('published');
    expect(statusFromDb('cancelled')).toBe('cancelled');
  });

  it('only sends editable profile columns', () => {
    const row = userChangesToRow({ displayName: 'Nok', provinceId: '', showProfile: false, tier: 'elite', email: 'x@y.z' } as never);
    expect(row).toEqual({ display_name: 'Nok', province_id: null, show_profile: false });
  });

  it('reads a profile row with safe defaults', () => {
    const user = userFromRow({
      id: 51, username: 'nok_1', email: 'nok@test.com', tier: null, display_name: null, bio: null, province_id: null,
      district_id: null, avatar_url: null, onboarding_status: null, onboarding_data: null, show_profile: null,
      public_profile_visible: null, public_area_visible: null, interests: null, deleted_at: null, created_at: null, updated_at: null,
    });
    expect(user).toMatchObject({ id: 51, tier: 'free', displayName: '', onboardingStatus: 'not_started', showProfile: true, interests: [] });
  });

  it('keeps a logged run on the day it was logged', () => {
    const startedAt = startedAtFromDateKey('2026-11-15');
    expect(localDateKey(startedAt)).toBe('2026-11-15');
    expect(workoutFromRow({ id: 3, started_at: startedAt, distance_km: '5.00', duration_sec: 1800, source: 'log', created_at: startedAt }))
      .toMatchObject({ id: '3', date: '2026-11-15', distanceKm: 5, durationMin: 30, source: 'log' });
  });

  it('maps device rows by provider', () => {
    expect(connectionsFromRows([{ provider: 'garmin', created_at: '2026-01-01T00:00:00Z', last_synced_at: null, import_runs: true, post_to_party: true }]))
      .toEqual({ garmin: { provider: 'garmin', connectedAt: '2026-01-01T00:00:00Z', lastSyncAt: '2026-01-01T00:00:00Z', importRuns: true, postToParty: true } });
  });
});
