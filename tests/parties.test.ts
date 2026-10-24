import { describe, expect, test } from 'vitest';
import { cancelParty, createParty, joinParty, leaveParty } from '../src/services/partyRepository';
import { buildPartyShareText } from '../src/utils/partyShare';
import { buildPartySessions } from '../src/data/mockPartySessions';
import { buildPartyActivities } from '../src/data/mockPartyActivities';
import type { EventRecord } from '../src/types/models';

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

const host = { id: 'host-1', displayName: 'หัวตี้' };
const input = {
  title: 'วิ่ง Easy run', type: 'Running', date: new Date(Date.now() + 86400000).toISOString(),
  location: 'สวนลุมพินี', description: 'วิ่งชิล', levelId: 'beginner' as const, capacity: 2,
};

describe('partyRepository', () => {
  test('the host is the first participant, joins fill seats until full', async () => {
    const storage = memoryStorage();
    const party = await createParty(host, 'beginner', input, storage);
    expect(party.participants).toEqual([{ id: 'host-1', name: 'หัวตี้', levelId: 'beginner' }]);

    const joined = await joinParty(party, { id: 'u2', name: 'เพื่อน' }, storage);
    expect(joined.participantCount).toBe(2);
    await expect(joinParty(party, { id: 'u3', name: 'อีกคน' }, storage)).rejects.toThrow('full');

    const left = await leaveParty(party, 'u2', storage);
    expect(left.participantCount).toBe(1);
  });

  test('only the host can cancel', async () => {
    const storage = memoryStorage();
    const party = await createParty(host, 'beginner', input, storage);
    await expect(cancelParty(party, 'someone-else', storage)).rejects.toThrow();
    expect((await cancelParty(party, 'host-1', storage)).status).toBe('cancelled');
  });
});

describe('buildPartyShareText', () => {
  const party = {
    id: 'p1', title: 'Interval เช้าวันเสาร์', type: 'Running', date: '2026-11-07T00:00:00.000Z', location: 'สวนลุมพินี',
    description: '', status: 'published', isParty: true, levelId: 'beginner', style: 'interval', capacity: 4,
    participants: [{ id: 'host-1', name: 'หัวตี้' }], organizer: { id: 'host-1', name: 'หัวตี้' },
  } as unknown as EventRecord;

  test('invites with the party details, seats left and the link', () => {
    const text = buildPartyShareText(party, 'https://lowrox.app/events/p1');
    expect(text).toContain('ลากเพซ');
    expect(text).toContain('Interval เช้าวันเสาร์');
    expect(text).toContain('สวนลุมพินี');
    expect(text).toContain('Beginner · เหลืออีกแค่ 3 ที่');
    expect(text.trim().endsWith('https://lowrox.app/events/p1')).toBe(true);
  });

  test('says when the party is full', () => {
    const full = { ...party, capacity: 1 };
    expect(buildPartyShareText(full, 'x')).toContain('ตี้เต็มแล้ว');
  });
});

describe('buildPartySessions', () => {
  const party = {
    id: 'p1', title: 'LSD 22 กม. เตรียมฮาล์ฟ', type: 'Running', date: '2026-11-08T22:00:00.000Z', location: 'สวนลุมพินี',
    style: 'long', capacity: 8, isParty: true, participants: [{ id: 'h', name: 'หัวตี้' }, { id: 'u', name: 'เพื่อน' }],
  } as unknown as EventRecord;

  test('runs weekly on the party slot, with the party itself as this week', () => {
    const sessions = buildPartySessions(party);
    expect(sessions).toHaveLength(11);
    const current = sessions.find(session => session.date === party.date)!;
    expect(current).toMatchObject({ title: party.title, kind: 'workout', rsvpCount: 2 });
    const slots = sessions.map(session => { const date = new Date(session.date); return `${date.getDay()} ${date.getHours()}:${date.getMinutes()}`; });
    expect(new Set(slots).size).toBe(1);
  });

  test('is stable for the same party', () => {
    expect(buildPartySessions(party)).toEqual(buildPartySessions(party));
  });
});

describe('buildPartyActivities', () => {
  const party = {
    id: 'p1', title: 'LSD 22 กม. เตรียมฮาล์ฟ', type: 'Running', date: '2026-11-08T22:00:00.000Z', location: 'สวนลุมพินี',
    style: 'long', levelId: 'intermediate', capacity: 8, isParty: true, participants: [{ id: 'h', name: 'หัวตี้' }, { id: 'u', name: 'เพื่อน' }],
  } as unknown as EventRecord;
  const now = new Date('2026-11-01T00:00:00.000Z');

  test('members post runs only after past workout sessions, newest first', () => {
    const feed = buildPartyActivities(party, now);
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every(activity => ['h', 'u'].includes(String(activity.member.id)))).toBe(true);
    expect(feed.every(activity => activity.distanceKm >= 14 && activity.distanceKm <= 24)).toBe(true);
    expect(feed.map(activity => activity.date)).toEqual([...feed.map(activity => activity.date)].sort().reverse());
  });

  test('is stable for the same party', () => {
    expect(buildPartyActivities(party, now)).toEqual(buildPartyActivities(party, now));
  });
});
