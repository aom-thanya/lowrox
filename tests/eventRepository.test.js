import { describe, it, expect } from 'vitest';
import { getEvents, getEventById, getJoinGroupUrl, isEventEnded } from '../src/services/eventRepository';

describe('eventRepository', () => {
  it('isEventEnded returns true for past dates and false for future dates', () => {
    const past = { date: new Date(Date.now() - 10000).toISOString() };
    const future = { date: new Date(Date.now() + 1000000).toISOString() };
    
    expect(isEventEnded(past)).toBe(true);
    expect(isEventEnded(future)).toBe(false);
  });

  it('getEvents filters out draft events', async () => {
    const events = await getEvents();
    const drafts = events.filter(e => e.status === 'draft');
    expect(drafts.length).toBe(0);
  });

  it('getEvents supports searching by query', async () => {
    const events = await getEvents({ query: 'วิ่ง' });
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].title).toContain('วิ่ง');
  });

  it('getEventById throws error for missing or draft events', async () => {
    await expect(getEventById('e5')).rejects.toThrow(); // e5 is draft
    await expect(getEventById('invalid-id')).rejects.toThrow();
  });

  it('getJoinGroupUrl throws error if not logged in', async () => {
    await expect(getJoinGroupUrl('e1', null)).rejects.toThrow('Unauthorized');
  });
});
