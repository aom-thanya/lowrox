import { test, expect } from 'vitest';
import { startLineSession, updateCurrentUser } from '../src/services/userRepository';
import { MOCK_LINE_PROFILE } from '../src/services/lineAuth';

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

test('first LINE sign-in creates a new account that still needs onboarding', () => {
  const storage = memoryStorage();
  const { user, isNew } = startLineSession(MOCK_LINE_PROFILE, storage);

  expect(isNew).toBe(true);
  expect(user).toMatchObject({
    id: `line-${MOCK_LINE_PROFILE.userId}`,
    authProvider: 'line',
    lineUserId: MOCK_LINE_PROFILE.userId,
    displayName: MOCK_LINE_PROFILE.displayName,
    email: MOCK_LINE_PROFILE.email,
    tier: 'free',
    onboardingStatus: 'not_started'
  });
  expect(JSON.parse(storage.getItem('mockSession')!)).toEqual({ id: user.id });
});

test('returning LINE sign-in reuses the account and keeps profile edits', () => {
  const storage = memoryStorage();
  const { user } = startLineSession(MOCK_LINE_PROFILE, storage);
  updateCurrentUser(user.id, { displayName: 'ชื่อใหม่', onboardingStatus: 'completed' }, storage);

  const again = startLineSession(MOCK_LINE_PROFILE, storage);

  expect(again.isNew).toBe(false);
  expect(again.user.displayName).toBe('ชื่อใหม่');
  expect(again.user.onboardingStatus).toBe('completed');
});
