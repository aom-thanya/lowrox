import { describe, expect, it } from 'vitest';
import { formatDateTimeShort, formatTimeAgo } from '../src/utils/formatDate';

const now = new Date('2026-11-21T10:40:00+07:00').getTime();
const ago = (ms: number) => new Date(now - ms).toISOString();
const MIN = 60_000, HR = 60 * MIN, DAY = 24 * HR;

describe('formatTimeAgo', () => {
  it('counts minutes and hours within a day', () => {
    expect(formatTimeAgo(ago(20_000), now)).toBe('just now');
    expect(formatTimeAgo(ago(MIN), now)).toBe('1 min ago');
    expect(formatTimeAgo(ago(5 * MIN), now)).toBe('5 mins ago');
    expect(formatTimeAgo(ago(HR), now)).toBe('1 hr ago');
    expect(formatTimeAgo(ago(23 * HR + 59 * MIN), now)).toBe('23 hrs ago');
  });

  it('counts days after a day, then falls back to the date', () => {
    expect(formatTimeAgo(ago(DAY), now)).toBe('1 day ago');
    expect(formatTimeAgo(ago(2 * DAY + 3 * HR), now)).toBe('2 days ago');
    expect(formatTimeAgo(ago(45 * DAY), now)).toBe(formatDateTimeShort(ago(45 * DAY)));
  });

  it('treats a clock slightly ahead as just now', () => {
    expect(formatTimeAgo(ago(-5_000), now)).toBe('just now');
  });
});
