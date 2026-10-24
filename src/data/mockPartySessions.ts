import type { EventRecord, PartySession, PartyStyle } from '../types/models';
import { seededRandom } from './mockParties';

// Mock events (sessions) inside a party: the party meets weekly on the same weekday and time,
// with an occasional social meet-up. Seeded by the party id so each party always shows the same list.
// Replace with an API.

const WEEKS_BACK = 6;
const WEEKS_AHEAD = 4;

const WORKOUTS: Record<PartyStyle, string[]> = {
  easy: ['Easy run ประจำสัปดาห์', 'วิ่งชิล Zone 2', 'Recovery run วันจันทร์'],
  long: ['Long run ประจำสัปดาห์', 'LSD สะสมระยะ', 'ซ้อมยาวก่อนลงฮาล์ฟ'],
  interval: ['Interval ที่ลู่', 'Track night 400 ม.', 'Interval 800 ม. × 6'],
  tempo: ['Tempo run ประจำสัปดาห์', 'Progression run', 'Fartlek 40 นาที'],
  hyrox: ['HYROX Simulation', 'ซ้อมสถานี Sled + Wall ball', 'Compromised running'],
  trail: ['เทรลประจำเดือน', 'ซ้อมขึ้นเขา', 'เทรลเช้าวันเสาร์'],
};
const SOCIALS = ['วิ่งเสร็จไปกินข้าวต้มกัน', 'ปาร์ตี้ฉลองครบ 10 รอบ', 'ไปเชียร์เพื่อนลงงานวิ่ง', 'Coffee run แวะคาเฟ่'];

export function buildPartySessions(party: EventRecord): PartySession[] {
  const random = seededRandom(`sessions-${party.id}`);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const capacity = party.capacity ?? 8;
  const workouts = WORKOUTS[party.style ?? 'easy'];

  return Array.from({ length: WEEKS_BACK + WEEKS_AHEAD + 1 }, (_, index) => {
    const week = index - WEEKS_BACK;
    const date = new Date(party.date);
    date.setDate(date.getDate() + week * 7);
    // This week's session is the party itself; roughly one in five others is a social meet-up.
    const isSocial = week !== 0 && random() < 0.2;
    return {
      id: `${party.id}-s${index + 1}`,
      title: week === 0 ? party.title : isSocial ? pick(SOCIALS) : pick(workouts),
      kind: isSocial ? 'social' : 'workout',
      date: date.toISOString(),
      location: party.location,
      rsvpCount: week === 0 ? party.participants?.length ?? 1 : 1 + Math.floor(random() * capacity),
    } satisfies PartySession;
  });
}
