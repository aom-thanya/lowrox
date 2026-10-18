import { describe, expect, test } from 'vitest';
import { cancelParty, createParty, joinParty, leaveParty } from '../src/services/partyRepository';
import { cancelBuddyRequest, readBuddyStatuses, requestBuddy } from '../src/services/buddyRepository';
import { rankBuddies, scoreBuddy } from '../src/utils/buddyMatching';
import { MOCK_MEMBERS, findMockMember } from '../src/data/mockMembers';

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

describe('buddy matching', () => {
  test('same level, goal, time and area scores 100 with a reason for each', () => {
    const member = findMockMember('m1')!;
    const match = scoreBuddy({ levelId: 'intermediate', goalType: 'buddy_event', timePresets: ['early_morning'], areaLabels: ['สวนลุมพินี'] }, member);
    expect(match.score).toBe(100);
    expect(match.reasons).toEqual(['เลเวลเดียวกัน', 'เป้าหมายเดียวกัน', 'ว่างเช้าตรู่เหมือนกัน', 'ซ้อมแถวสวนลุมพินี']);
  });

  test('ranking puts the closest level first', () => {
    const ranked = rankBuddies({ levelId: 'beginner', goalType: '', timePresets: [], areaLabels: [] }, MOCK_MEMBERS);
    expect(ranked[0].member.levelId).toBe('beginner');
    expect(ranked.at(-1)!.score).toBeLessThanOrEqual(ranked[0].score);
  });

  test('requests become buddies for auto-accepting members and stay pending otherwise', async () => {
    const storage = memoryStorage();
    await requestBuddy('u1', findMockMember('m1')!, storage);
    await requestBuddy('u1', findMockMember('m4')!, storage);
    expect(readBuddyStatuses('u1', storage)).toEqual({ m1: 'buddy', m4: 'pending' });
    expect(cancelBuddyRequest('u1', 'm4', storage)).toEqual({ m1: 'buddy' });
  });
});
