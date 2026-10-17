import type { UserId } from '../types/models';
import type { MockMember } from '../data/mockMembers';

// Mock buddy connections per user in localStorage. 'pending' until the other side accepts.
export type BuddyStatus = 'pending' | 'buddy';
type BuddyStorage = Pick<Storage, 'getItem' | 'setItem'>;
const buddiesKey = (userId: UserId) => `lowrox:buddies:${userId}`;

export function readBuddyStatuses(userId: UserId, storage: BuddyStorage = localStorage): Record<string, BuddyStatus> {
  return JSON.parse(storage.getItem(buddiesKey(userId)) || '{}');
}

function writeStatus(userId: UserId, memberId: string, status: BuddyStatus | null, storage: BuddyStorage) {
  const statuses = readBuddyStatuses(userId, storage);
  if (status) statuses[memberId] = status; else delete statuses[memberId];
  storage.setItem(buddiesKey(userId), JSON.stringify(statuses));
  return statuses;
}

// Simulates the request round trip: members flagged autoAccept accept immediately.
export async function requestBuddy(userId: UserId, member: MockMember, storage: BuddyStorage = localStorage) {
  await new Promise(resolve => setTimeout(resolve, 700));
  return writeStatus(userId, member.id, member.autoAccept ? 'buddy' : 'pending', storage);
}

export function cancelBuddyRequest(userId: UserId, memberId: string, storage: BuddyStorage = localStorage) {
  return writeStatus(userId, memberId, null, storage);
}
