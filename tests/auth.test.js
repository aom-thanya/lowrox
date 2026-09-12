import { test, assert } from 'vitest';


import { getLoginDestination } from '../src/utils/authRedirect.js';

test('getLoginDestination returns onboarding if status is not completed', () => {
  const user = { onboardingStatus: 'not_started' };
  assert.equal(getLoginDestination(user, null), '/onboarding');
});

test('getLoginDestination returns profile if status is completed', () => {
  const user = { onboardingStatus: 'completed' };
  assert.equal(getLoginDestination(user, null), '/profile');
});

test('getLoginDestination restores internal URL correctly', () => {
  const user = { onboardingStatus: 'completed' };
  const from = { pathname: '/profile/settings', search: '?q=1', hash: '#top' };
  assert.deepEqual(getLoginDestination(user, from), { pathname: '/profile/settings', search: '?q=1', hash: '#top' });
});

test('getLoginDestination ignores external or invalid URLs and falls back to default', () => {
  const user = { onboardingStatus: 'completed' };
  
  // External URL
  assert.equal(getLoginDestination(user, { pathname: '//example.com' }), '/profile');
  
  // Login URL
  assert.equal(getLoginDestination(user, { pathname: '/login' }), '/profile');
  
  // No pathname
  assert.equal(getLoginDestination(user, {}), '/profile');
});
