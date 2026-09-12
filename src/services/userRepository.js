// Adapter for the project's existing local mock authentication.
// All user fields live in one record per account; the session contains only its ID.
const userKey = (id) => `lowrox:user:${id}`;

export function readUser(id, storage = localStorage) {
  const raw = storage.getItem(userKey(id));
  if (!raw) throw new Error('User record not found');
  const user = JSON.parse(raw);
  if (user.id !== id) throw new Error('Invalid user record');
  return user;
}

export function writeUser(user, storage = localStorage) {
  storage.setItem(userKey(user.id), JSON.stringify(user));
  return user;
}

export function restoreSession(storage = localStorage) {
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

export function startSession(defaultUser, storage = localStorage) {
  const user = storage.getItem(userKey(defaultUser.id))
    ? readUser(defaultUser.id, storage)
    : writeUser(defaultUser, storage);
  storage.setItem('mockSession', JSON.stringify({ id: user.id }));
  return user;
}

export function readCurrentUser(expectedId, storage = localStorage) {
  const session = JSON.parse(storage.getItem('mockSession') || 'null');
  if (!session || session.id !== expectedId) throw new Error('Session changed');
  return readUser(expectedId, storage);
}

export function updateCurrentUser(expectedId, changes, storage = localStorage) {
  const current = readCurrentUser(expectedId, storage);
  // Callers only pass explicitly permitted profile/status fields.
  return writeUser({ ...current, ...changes, id: current.id, updated_at: new Date().toISOString() }, storage);
}
