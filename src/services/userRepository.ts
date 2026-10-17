import type { User, UserId } from '../types/models';
import type { LineProfile } from './lineAuth';
// Adapter for the project's existing local mock authentication.
// All user fields live in one record per account; the session contains only its ID.
const userKey = (id: UserId) => `lowrox:user:${id}`;

export function readUser(id: UserId, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
  const raw = storage.getItem(userKey(id));
  if (!raw) throw new Error('User record not found');
  const user: User = JSON.parse(raw);
  if (user.id !== id) throw new Error('Invalid user record');
  return user;
}

export function writeUser(user: User, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
  storage.setItem(userKey(user.id), JSON.stringify(user));
  return user;
}

export function restoreSession(storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): User | null {
  const raw = storage.getItem('mockSession');
  if (!raw) return null;
  const session = JSON.parse(raw);
  if (!session?.id) throw new Error('Invalid session');
  // Migrate an existing full-user session without losing its data.
  if (session.username && !storage.getItem(userKey(session.id))) writeUser(session, storage);
  const user = readUser(session.id, storage);
  storage.setItem('mockSession', JSON.stringify({ id: user.id }));
  return user;
}

export function startSession(defaultUser: User, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
  const user = storage.getItem(userKey(defaultUser.id))
    ? readUser(defaultUser.id, storage)
    : writeUser(defaultUser, storage);
  storage.setItem('mockSession', JSON.stringify({ id: user.id }));
  return user;
}

export function readCurrentUser(expectedId: UserId, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
  const session = JSON.parse(storage.getItem('mockSession') || 'null');
  if (!session || session.id !== expectedId) throw new Error('Session changed');
  return readUser(expectedId, storage);
}

export function updateCurrentUser(expectedId: UserId, changes: Partial<User>, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
  const current = readCurrentUser(expectedId, storage);
  // Callers only pass explicitly permitted profile/status fields.
  return writeUser({ ...current, ...changes, id: current.id, updated_at: new Date().toISOString() }, storage);
}

// A LINE account maps to exactly one Lowrox user. The first sign-in creates the account
// (onboarding not started); later sign-ins reuse it so profile edits are kept.
export function startLineSession(profile: LineProfile, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
  const id = `line-${profile.userId}`;
  const isNew = !storage.getItem(userKey(id));
  const now = new Date().toISOString();
  const user = startSession({
    id,
    authProvider: 'line',
    lineUserId: profile.userId,
    displayName: profile.displayName,
    avatarUrl: profile.pictureUrl || '',
    email: profile.email,
    tier: 'free',
    onboardingStatus: 'not_started',
    created_at: now,
    updated_at: now
  }, storage);
  return { user, isNew };
}
