import type { EventRecord, User, UserId } from '../types/models';
import { isPublicEvent, eventHasEnded, selectHostedEvents } from '../utils/eventVisibility';
import { applyPartyState, readStoredParties } from './partyRepository';
import { buildMockParties } from '../data/mockParties';
import { findPersona } from '../utils/partyPersonas';
// Mock Event Repository

const initialEvents: EventRecord[] = ([
  {
    id: 'e1',
    title: 'วิ่งสวนลุมยามเช้า - สำหรับผู้เริ่มต้น',
    type: 'Running',
    date: '2026-10-15T06:30:00+07:00', // Future event
    location: 'สวนลุมพินี, กรุงเทพฯ',
    description: 'ชวนเพื่อนๆ ที่เพิ่งเริ่มวิ่งมาวิ่งด้วยกัน เพซ 7-8 วิ่งสบายๆ แวะพักดื่มน้ำ คุยกันชิลๆ',
    status: 'published',
    organizer: {
      id: 'u2',
      name: 'RunHappy',
      avatarUrl: 'https://i.pravatar.cc/150?u=2'
    },
    joinUrl: 'https://line.me/ti/g2/mock-run-group-1' // External link mockup
  },
  {
    id: 'e2',
    title: 'ปั่นจักรยาน Skylane ระยะไกล',
    type: 'Cycling',
    date: '2026-10-20T16:00:00+07:00', // Future event
    location: 'สนามปั่นจักรยานเจริญสุขมงคลจิต (Skylane)',
    description: 'หาเพื่อนปั่นสองรอบสนาม (ประมาณ 47 กม.) ความเร็ว 25-30 km/h',
    status: 'published',
    organizer: {
      id: 'u3',
      name: 'BikeMaster',
      avatarUrl: null
    },
    joinUrl: 'https://line.me/ti/g2/mock-bike-group-2'
  },
  {
    id: 'e3',
    title: 'ตีแบดมินตันคอร์ทเย็นวันศุกร์',
    type: 'Badminton',
    date: '2026-10-22T19:00:00+07:00', // Future event
    location: 'สุขุมวิท 71',
    description: 'ขาดคน 2 คน ระดับมือปานกลาง (Intermediate) มาร่วมจอยกันได้',
    status: 'published',
    organizer: {
      id: 'u4',
      name: 'SmashBro',
      avatarUrl: 'https://i.pravatar.cc/150?u=4'
    },
    joinUrl: null // No join URL provided yet
  },
  {
    id: 'e4',
    title: 'ซ้อมวิ่งมาราธอน 30K',
    type: 'Running',
    date: '2026-09-01T05:00:00+07:00', // Past event
    endDate: '2026-09-01T09:00:00+07:00',
    location: 'พุทธมณฑล, นครปฐม',
    description: 'ซ้อมยาวเตรียมแข่งมาราธอน เพซ 6 ถ้วน',
    status: 'published',
    organizer: {
      id: 'u5',
      name: 'Marathoner',
      avatarUrl: 'https://i.pravatar.cc/150?u=5'
    },
    joinUrl: 'https://line.me/ti/g2/mock-run-group-3'
  },
  {
    id: 'e5',
    title: 'กิจกรรมร่าง (Draft) ไม่ควรแสดงผล',
    type: 'Running',
    date: '2026-11-01T06:00:00+07:00', 
    location: 'สนามศุภชลาศัย',
    description: 'ทดสอบระบบ',
    status: 'draft', // Should be filtered out
    organizer: {
      id: 'u1',
      name: 'Admin',
      avatarUrl: null
    },
    joinUrl: null
  },
  {
    id: 'e6',
    title: 'วิ่งเทรลเขาฉลาก ยกเลิกแล้ว',
    type: 'Running',
    date: '2026-12-05T06:00:00+07:00',
    location: 'ชลบุรี',
    description: 'ยกเลิกเนื่องจากพายุเข้า',
    status: 'cancelled',
    organizer: {
      id: 'u2',
      name: 'RunHappy',
      avatarUrl: 'https://i.pravatar.cc/150?u=2'
    },
    joinUrl: null
  }
] as Omit<EventRecord, 'hostUserId'>[]).map(event => ({ ...event, hostUserId: event.organizer.id, visibility: 'public' }));

// Seeded events, generated mock parties and parties members created, with joins applied.
const allEvents = (): EventRecord[] => [...initialEvents, ...buildMockParties(), ...readStoredParties()].map(event => applyPartyState(event));

export const EVENTS_PAGE_SIZE = 12;

export interface EventQuery { query?: string; type?: string; area?: string; level?: string; persona?: string; page?: number; pageSize?: number }
export interface EventPage { events: EventRecord[]; total: number; page: number; pageCount: number }

// Helper to check if event has ended
export function isEventEnded(event: Pick<EventRecord, 'date' | 'endDate' | 'status'>) {
  return eventHasEnded(event);
}

/**
 * Get one page of public events (published).
 * Can be filtered by type, area, search query, level and the searcher's persona.
 */
export async function getEvents({ query = '', type = '', area = '', level = '', persona = '', page = 1, pageSize = EVENTS_PAGE_SIZE }: EventQuery = {}): Promise<EventPage> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let results = allEvents().filter(isPublicEvent);

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.description.toLowerCase().includes(q) || 
      e.location.toLowerCase().includes(q)
    );
  }

  if (type) {
    results = results.filter(e => e.type === type);
  }

  if (area) {
    results = results.filter(e => e.location.includes(area));
  }

  // "ตี้เลเวลของฉัน": parties for this level or open to all levels.
  if (level) {
    results = results.filter(e => e.isParty && (e.levelId === level || e.levelId === 'all'));
  }

  const selectedPersona = findPersona(persona);
  if (selectedPersona) {
    results = results.filter(e => e.isParty && selectedPersona.matches(e));
  }

  // Sort: Upcoming events first (closest to now), then past events.
  const now = new Date();
  
  results.sort((a, b) => {
    const aEnded = isEventEnded(a);
    const bEnded = isEventEnded(b);
    
    // Both same status (ended or upcoming)
    if (aEnded === bEnded) {
      if (!aEnded) {
        // Upcoming: closest first
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        // Ended: most recent first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    }
    
    // Upcoming first
    return aEnded ? 1 : -1;
  });

  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  return { events: results.slice((current - 1) * pageSize, current * pageSize), total: results.length, page: current, pageCount };
}

/**
 * Get a specific event by ID
 */
export async function getEventById(id: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const event = allEvents().find(e => e.id === id);
  if (!event || !isPublicEvent(event)) {
    throw new Error('Event not found or not public');
  }
  return event;
}

/**
 * Join event group (Mock server-side check)
 * @param {string} eventId 
 * @param {object} user - Must be provided to simulate session check
 */
export async function getJoinGroupUrl(eventId: string, user: User | null) {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const event = allEvents().find(e => e.id === eventId);
  if (!event || !isPublicEvent(event)) {
    throw new Error('Event not found');
  }
  
  if (isEventEnded(event) || event.status === 'cancelled' || event.registrationClosed || (Number.isFinite(event.capacity) && Number.isFinite(event.participantCount) && event.participantCount! >= event.capacity!)) {
    throw new Error('Event is no longer active');
  }
  
  return event.joinUrl;
}

export async function getHostedEvents(userId: UserId, { tab = 'upcoming', limit = 6 } = {}) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const groups = selectHostedEvents(allEvents(), userId);
  const selected = groups[tab as keyof typeof groups] || groups.upcoming;
  const counts = Object.fromEntries(Object.entries(groups).map(([key, items]) => [key, items.length]));
  const size = Math.max(6, Math.floor(Number(limit) || 6));
  return { events: selected.slice(0, size), counts, total: selected.length, hasMore: selected.length > size };
}

// Existing mock members, sourced only from identities already present in events.
export function getKnownEventMember(userId: UserId) {
  const event = allEvents().find(item => isPublicEvent(item) && String(item.hostUserId) === String(userId));
  return event ? { id: event.hostUserId, displayName: event.organizer.name, avatarUrl: event.organizer.avatarUrl } : null;
}
