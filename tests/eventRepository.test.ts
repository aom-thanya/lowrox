import { describe, it, expect } from 'vitest';
import { EVENTS_PAGE_SIZE, getEvents, getEventById, getJoinGroupUrl, isEventEnded } from '../src/services/eventRepository';
import { buildMockParties } from '../src/data/mockParties';
import { findPersona } from '../src/utils/partyPersonas';

// All results across pages, for checking filters.
const everything = async (filters = {}) => (await getEvents({ ...filters, pageSize: 1000 })).events;

describe('eventRepository', () => {
  it('isEventEnded returns true for past dates and false for future dates', () => {
    const past = { status: 'published', date: new Date(Date.now() - 10000).toISOString() };
    const future = { status: 'published', date: new Date(Date.now() + 1000000).toISOString() };
    
    expect(isEventEnded(past)).toBe(true);
    expect(isEventEnded(future)).toBe(false);
  });

  it('getEvents filters out draft events', async () => {
    const events = await everything();
    const drafts = events.filter(e => e.status === 'draft');
    expect(drafts.length).toBe(0);
  });

  it('getEvents supports searching by query', async () => {
    const events = await everything({ query: 'วิ่ง' });
    expect(events.length).toBeGreaterThan(0);
    events.forEach(e => expect(`${e.title} ${e.description} ${e.location}`).toContain('วิ่ง'));
  });

  it('getEvents returns one page at a time and clamps out-of-range pages', async () => {
    const first = await getEvents();
    expect(first.events).toHaveLength(EVENTS_PAGE_SIZE);
    expect(first.pageCount).toBe(Math.ceil(first.total / EVENTS_PAGE_SIZE));
    expect(first.pageCount).toBeGreaterThan(3);

    const second = await getEvents({ page: 2 });
    expect(second.page).toBe(2);
    expect(second.events.map(e => e.id)).not.toEqual(expect.arrayContaining(first.events.map(e => e.id)));

    const beyond = await getEvents({ page: 999 });
    expect(beyond.page).toBe(first.pageCount);
  });

  it('getEvents filters parties by the searcher persona', async () => {
    const hyrox = await everything({ persona: 'hyrox' });
    expect(hyrox.length).toBeGreaterThan(0);
    hyrox.forEach(e => expect(e.style).toBe('hyrox'));

    const newbie = await everything({ persona: 'newbie' });
    expect(newbie.length).toBeGreaterThan(0);
    newbie.forEach(e => expect(['beginner', 'all']).toContain(e.levelId));

    const afterWork = await everything({ persona: 'after_work' });
    expect(afterWork.length).toBeGreaterThan(0);
    afterWork.forEach(e => {
      const date = new Date(e.date);
      expect([0, 6]).not.toContain(date.getDay());
      expect(date.getHours()).toBeGreaterThanOrEqual(18);
    });

    // Unknown personas are ignored rather than emptying the list.
    expect((await getEvents({ persona: 'nope' })).total).toBe((await getEvents()).total);
  });

  it('getEventById throws error for missing or draft events', async () => {
    await expect(getEventById('e5')).rejects.toThrow(); // e5 is draft
    await expect(getEventById('invalid-id')).rejects.toThrow();
  });

  it('getJoinGroupUrl throws error if not logged in', async () => {
    await expect(getJoinGroupUrl('e1', null)).rejects.toThrow('Unauthorized');
  });
});

describe('mock parties', () => {
  it('are plentiful, stable for the same day, and always have upcoming dates', () => {
    const now = new Date();
    const parties = buildMockParties(now);
    expect(parties.length).toBeGreaterThan(60);
    expect(buildMockParties(now).map(p => p.id)).toEqual(parties.map(p => p.id));
    expect(parties.filter(p => new Date(p.date) > now).length).toBeGreaterThan(50);
  });

  it('never overfill a party and every persona has parties to show', () => {
    const parties = buildMockParties();
    parties.forEach(p => expect(p.participants!.length).toBeLessThanOrEqual(p.capacity!));
    ['newbie', 'faster', 'farther', 'hyrox', 'early', 'after_work', 'weekend'].forEach(id => {
      expect(parties.some(findPersona(id)!.matches)).toBe(true);
    });
  });
});
