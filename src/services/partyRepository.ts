import type { EventRecord, PartyLevel, PartyParticipant, User } from '../types/models';

// Mock persistence for parties (ตี้ซ้อม) in localStorage:
//   lowrox:parties              — parties created by users
//   lowrox:party-state:<id>     — joins/leaves and cancellation for any party, including seeded ones
type PartyStorage = Pick<Storage, 'getItem' | 'setItem'>;
const PARTIES_KEY = 'lowrox:parties';
const stateKey = (eventId: string) => `lowrox:party-state:${eventId}`;
interface PartyState { participants: PartyParticipant[]; status: string }

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function readStoredParties(storage: PartyStorage = localStorage): EventRecord[] {
  return JSON.parse(storage.getItem(PARTIES_KEY) || '[]');
}

// Overlays saved joins and status, and keeps participantCount in sync.
export function applyPartyState(event: EventRecord, storage: PartyStorage = localStorage): EventRecord {
  if (!event.isParty) return event;
  const state: PartyState | null = JSON.parse(storage.getItem(stateKey(event.id)) || 'null');
  const participants = state?.participants ?? event.participants ?? [];
  return { ...event, participants, participantCount: participants.length, status: state?.status ?? event.status };
}

function saveState(event: EventRecord, changes: Partial<PartyState>, storage: PartyStorage) {
  const current = applyPartyState(event, storage);
  const next: PartyState = { participants: current.participants ?? [], status: current.status, ...changes };
  storage.setItem(stateKey(event.id), JSON.stringify(next));
  return applyPartyState(event, storage);
}

export const participantFrom = (user: User, levelId?: PartyLevel): PartyParticipant => ({
  id: user.id,
  name: user.displayName || user.username || 'สมาชิก',
  levelId,
});

export interface NewPartyInput {
  title: string;
  type: string;
  date: string; // ISO
  location: string;
  description: string;
  levelId: PartyLevel;
  capacity: number;
  invited?: PartyParticipant[];
}

export async function createParty(host: User, hostLevel: PartyLevel | undefined, input: NewPartyInput, storage: PartyStorage = localStorage) {
  await delay(400);
  const { invited = [], ...details } = input;
  const party: EventRecord = {
    id: `p-${Date.now().toString(36)}`,
    ...details,
    status: 'published',
    visibility: 'public',
    isParty: true,
    hostUserId: host.id,
    organizer: { id: host.id, name: host.displayName || host.username || 'หัวตี้', avatarUrl: host.avatarUrl || null },
    joinUrl: null,
    participants: [participantFrom(host, hostLevel), ...invited].slice(0, input.capacity),
  };
  storage.setItem(PARTIES_KEY, JSON.stringify([...readStoredParties(storage), party]));
  return applyPartyState(party, storage);
}

export async function joinParty(event: EventRecord, participant: PartyParticipant, storage: PartyStorage = localStorage) {
  await delay(300);
  const current = applyPartyState(event, storage);
  const participants = current.participants ?? [];
  if (participants.some(item => String(item.id) === String(participant.id))) return current;
  if (Number.isFinite(current.capacity) && participants.length >= current.capacity!) throw new Error('Party is full');
  return saveState(event, { participants: [...participants, participant] }, storage);
}

export async function leaveParty(event: EventRecord, userId: User['id'], storage: PartyStorage = localStorage) {
  await delay(300);
  const participants = (applyPartyState(event, storage).participants ?? []).filter(item => String(item.id) !== String(userId));
  return saveState(event, { participants }, storage);
}

export async function cancelParty(event: EventRecord, userId: User['id'], storage: PartyStorage = localStorage) {
  await delay(300);
  if (String(event.hostUserId) !== String(userId)) throw new Error('Only the host can cancel');
  return saveState(event, { status: 'cancelled' }, storage);
}
