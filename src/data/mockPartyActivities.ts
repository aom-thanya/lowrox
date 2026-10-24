import type { EventRecord, PartyActivity, PartyLevel, PartyStyle } from '../types/models';
import { MOCK_MEMBERS } from './mockMembers';
import { seededRandom } from './mockParties';
import { buildPartySessions } from './mockPartySessions';

// Mock activity feed for a party: after each past session a few members post their run.
// Seeded by the party id so the feed is stable across reloads. Replace with an API.

const DEVICES = ['Apple Watch Series 10', 'Garmin Forerunner 265', 'COROS PACE 3', 'Garmin Fenix 8', 'iPhone'];
// Typical pace in min/km by level, and session distance in km by style.
const PACE: Record<PartyLevel, number> = { beginner: 8, intermediate: 6.4, advanced: 5.3, elite: 4.5, all: 6.8 };
const DISTANCE: Record<PartyStyle, [number, number]> = {
  easy: [5, 8], long: [14, 24], interval: [7, 10], tempo: [7, 10], hyrox: [8, 9], trail: [10, 18],
};

const titleFor = (date: Date) => {
  const hour = date.getHours();
  return hour < 11 ? 'วิ่งเช้า' : hour < 16 ? 'วิ่งกลางวัน' : 'วิ่งเย็น';
};

// A wobbly closed loop, like a lap of a park.
function loop(random: () => number): [number, number][] {
  const points = 14;
  const [cx, cy] = [50 + (random() - 0.5) * 10, 50 + (random() - 0.5) * 10];
  return Array.from({ length: points + 1 }, (_, index) => {
    const angle = ((index % points) / points) * Math.PI * 2;
    const radius = 26 + random() * 14;
    return [Math.round(cx + Math.cos(angle) * radius * 1.3), Math.round(cy + Math.sin(angle) * radius * 0.85)];
  });
}

export function buildPartyActivities(party: EventRecord, now = new Date()): PartyActivity[] {
  const random = seededRandom(`feed-${party.id}`);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const level = party.levelId ?? 'all';
  const [shortest, longest] = DISTANCE[party.style ?? 'easy'];
  const people = party.participants?.length
    ? party.participants
    : MOCK_MEMBERS.slice(0, 4).map(member => ({ id: member.id, name: member.displayName, levelId: member.levelId }));
  const past = buildPartySessions(party).filter(session => session.kind === 'workout' && new Date(session.date) < now).reverse();

  return past.flatMap(session => {
    const runners = [...people].sort(() => random() - 0.5).slice(0, 1 + Math.floor(random() * Math.min(3, people.length)));
    return runners.map((member, index) => {
      const distanceKm = Math.round((shortest + random() * (longest - shortest)) * 100) / 100;
      const pace = PACE[member.levelId ?? level] * (0.92 + random() * 0.16);
      // Members save their run a little after the session ends.
      const date = new Date(new Date(session.date).getTime() + (distanceKm * pace + 10 + random() * 40) * 60000);
      return {
        id: `${session.id}-a${index + 1}`,
        member,
        date: date.toISOString(),
        device: pick(DEVICES),
        place: session.location,
        title: random() < 0.4 ? session.title : titleFor(date),
        distanceKm,
        durationMin: distanceKm * pace,
        achievements: random() < 0.35 ? 1 + Math.floor(random() * 3) : 0,
        kudos: Math.floor(random() * 12),
        comments: random() < 0.4 ? 1 + Math.floor(random() * 4) : 0,
        route: loop(random),
      } satisfies PartyActivity;
    });
  }).sort((a, b) => b.date.localeCompare(a.date));
}
