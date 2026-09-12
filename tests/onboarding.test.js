import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge, calculatePaceAndSpeed, calculateTargetDateString } from '../src/utils/onboardingUtils.js';

test('calculateAge calculates correct age considering birth month/day', () => {
  const today = new Date();
  
  const getLocalDateString = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Birth date exactly 20 years ago today
  const dob1 = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
  assert.equal(calculateAge(getLocalDateString(dob1)), 20);
  
  // Birth date 20 years ago but tomorrow (so still 19)
  const dob2 = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate() + 1);
  assert.equal(calculateAge(getLocalDateString(dob2)), 19);
});

test('calculateAge returns empty string for missing dob', () => {
  assert.equal(calculateAge(''), '');
  assert.equal(calculateAge(null), '');
});

test('calculatePaceAndSpeed calculates correct pace and speed', () => {
  // 5km in 30 mins -> Pace: 6:00, Speed: 10.0
  assert.deepEqual(calculatePaceAndSpeed(5, 30), { paceStr: '6:00', speedStr: '10.0' });
  
  // 10km in 45 mins -> Pace: 4:30, Speed: 13.3
  assert.deepEqual(calculatePaceAndSpeed(10, 45), { paceStr: '4:30', speedStr: '13.3' });
});

test('calculatePaceAndSpeed handles invalid inputs', () => {
  assert.deepEqual(calculatePaceAndSpeed(0, 30), { paceStr: '', speedStr: '' });
  assert.deepEqual(calculatePaceAndSpeed(5, 0), { paceStr: '', speedStr: '' });
  assert.deepEqual(calculatePaceAndSpeed(-1, 30), { paceStr: '', speedStr: '' });
  assert.deepEqual(calculatePaceAndSpeed(null, undefined), { paceStr: '', speedStr: '' });
});

test('calculateTargetDateString calculates target dates correctly', () => {
  const now = new Date();
  const getExpectedDate = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  assert.equal(calculateTargetDateString('plus_1_month', ''), getExpectedDate(1));
  assert.equal(calculateTargetDateString('plus_3_months', ''), getExpectedDate(3));
  assert.equal(calculateTargetDateString('plus_6_months', ''), getExpectedDate(6));
  assert.equal(calculateTargetDateString('custom_date', '2026-10-10'), '2026-10-10');
  assert.equal(calculateTargetDateString('', '', 'system_event'), '2026-12-14');
  assert.equal(calculateTargetDateString('', '', ''), '');
});
