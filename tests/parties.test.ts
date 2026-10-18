import { describe, expect, test } from 'vitest';
import { cancelParty, createParty, joinParty, leaveParty } from '../src/services/partyRepository';

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
