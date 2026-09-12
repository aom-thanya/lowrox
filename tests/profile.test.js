import { test, assert } from 'vitest';


import { readFileSync } from 'node:fs';
import { profileFromUser, validateProfile, hasProfileChanges, characterCount } from '../src/utils/profile.js';
import { validateImageFile, cropBounds, MAX_AVATAR_BYTES } from '../src/utils/imageUpload.js';
import { restoreSession, startSession, readUser, readCurrentUser, updateCurrentUser } from '../src/services/userRepository.js';

import areas from '../src/data/thaiAreas.json';
const profile = profileFromUser({ username: 'test' });
const storage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
};

test('name trims whitespace and validates both boundaries without restricting Thai or emoji', () => {
  for (const name of ['', '   ']) assert.equal(validateProfile({ ...profile, displayName: name }, areas).displayName, 'กรุณากรอกชื่อที่แสดง');
  for (const name of ['ก', 'a'.repeat(51)]) assert.ok(validateProfile({ ...profile, displayName: name }, areas).displayName);
  for (const name of [' กข ', 'a'.repeat(50), '🏃🏃']) assert.equal(validateProfile({ ...profile, displayName: name }, areas).displayName, undefined);
});

test('bio character count and validation include pasted values over the limit', () => {
  assert.equal(characterCount('🏃'.repeat(300)), 300);
  assert.equal(validateProfile({ ...profile, bio: '🏃'.repeat(300) }, areas).bio, undefined);
  assert.ok(validateProfile({ ...profile, bio: 'ก'.repeat(301) }, areas).bio);
});

test('all 77 provinces have unique IDs and valid district ownership', () => {
  assert.equal(areas.length, 77);
  assert.equal(new Set(areas.map((area) => area.value)).size, 77);
  const all = areas.flatMap((area) => area.districts.map((district) => district.value));
  assert.equal(new Set(all).size, all.length);
  assert.ok(areas.every((area) => area.districts.length > 0));
  const [first, second] = areas;
  assert.deepEqual(validateProfile({ ...profile, provinceId: first.value, districtId: first.districts[0].value }, areas), {});
  assert.ok(validateProfile({ ...profile, provinceId: first.value, districtId: second.districts[0].value }, areas).districtId);
  assert.ok(validateProfile({ ...profile, districtId: first.districts[0].value }, areas).districtId);
});

test('avatar changes participate in dirty state and reset', () => {
  assert.equal(hasProfileChanges(profile, profile), false);
  const changed = { ...profile, avatarUrl: 'data:image/webp;base64,abc' };
  assert.equal(hasProfileChanges(changed, profile), true);
  assert.equal(hasProfileChanges({ ...changed, avatarUrl: profile.avatarUrl }, profile), false);
});

test('upload validates supported types and exact 5 MB boundary', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.equal(validateImageFile({ type, size: MAX_AVATAR_BYTES }), '');
  assert.ok(validateImageFile({ type: 'image/svg+xml', size: 1 }));
  assert.ok(validateImageFile({ type: 'image/jpeg', size: MAX_AVATAR_BYTES + 1 }));
});

test('square crop stays within portrait and landscape images at zoom and pan extremes', () => {
  for (const [width, height] of [[1000, 600], [600, 1000]]) {
    for (const zoom of [1, 3]) for (const x of [0, 50, 100]) for (const y of [0, 50, 100]) {
      const { sx, sy, side } = cropBounds(width, height, zoom, x, y);
      assert.ok(sx >= 0 && sy >= 0 && sx + side <= width && sy + side <= height);
    }
  }
});

test('legacy session migration retains data and stores only an ID in session', () => {
  const db = storage();
  const legacy = { id: 1, username: 'test', onboardingStatus: 'completed' };
  db.setItem('mockSession', JSON.stringify(legacy));
  assert.deepEqual(restoreSession(db), legacy);
  assert.deepEqual(JSON.parse(db.getItem('mockSession')), { id: 1 });
});

test('saved fields survive refresh and re-login; other users stay isolated', () => {
  const db = storage();
  const first = { id: 1, username: 'test', onboardingStatus: 'completed' };
  startSession(first, db);
  const changes = { displayName: 'Runner', bio: 'Morning runs', avatarUrl: 'data:image/webp;base64,abc', provinceId: areas[0].value, districtId: areas[0].districts[0].value };
  updateCurrentUser(1, changes, db);
  assert.equal(restoreSession(db).displayName, 'Runner');
  db.removeItem('mockSession');
  startSession({ id: 2, username: 'new' }, db);
  assert.equal(readCurrentUser(2, db).displayName, undefined);
  assert.throws(() => updateCurrentUser(1, { displayName: 'wrong user' }, db));
  startSession(first, db);
  for (const [key, value] of Object.entries(changes)) assert.equal(readCurrentUser(1, db)[key], value);
});

test('failed persistence leaves last saved record intact and rejects instead of reporting success', () => {
  const db = storage();
  startSession({ id: 1, username: 'test' }, db);
  const failing = { ...db, setItem() { throw new Error('Quota exceeded'); } };
  assert.throws(() => updateCurrentUser(1, { displayName: 'Unsaved' }, failing));
  assert.equal(readUser(1, db).displayName, undefined);
});

test('missing/corrupt data raises a recoverable load error', () => {
  const db = storage();
  startSession({ id: 1, username: 'test' }, db);
  db.setItem('lowrox:user:1', '{');
  assert.throws(() => readCurrentUser(1, db));
  db.setItem('lowrox:user:1', JSON.stringify({ id: 1, username: 'test' }));
  assert.equal(readCurrentUser(1, db).username, 'test');
});

test('saving onboarding data persists correctly in user record', () => {
  const db = storage();
  startSession({ id: 1, username: 'test' }, db);
  
  // Initially no onboardingData
  const initialUser = readCurrentUser(1, db);
  assert.equal(initialUser.onboardingData, undefined);

  const onboardingData = { goals: [{ goalType: 'increase_distance' }] };
  updateCurrentUser(1, { onboardingData }, db);
  
  const current = readCurrentUser(1, db);
  assert.deepEqual(current.onboardingData, onboardingData);
  
  // Updating other fields doesn't wipe onboarding data
  updateCurrentUser(1, { displayName: 'John' }, db);
  const updated = readCurrentUser(1, db);
  assert.equal(updated.displayName, 'John');
  assert.deepEqual(updated.onboardingData, onboardingData);
});
