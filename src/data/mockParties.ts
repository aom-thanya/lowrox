import type { EventRecord, PartyLevel, PartyParticipant, PartyStyle } from '../types/models';
import { MOCK_MEMBERS } from './mockMembers';

// Mock parties (ตี้ซ้อม) for the party list. Generated from today's date so the list never goes stale,
// and seeded by the party's calendar date so a given day always produces the same parties (and ids).
// Replace with an API.

const DAYS_BACK = 5;
const DAYS_AHEAD = 30;

type Venue = { place: string; area: string; meet: string };

const PARKS: Venue[] = [
  { place: 'สวนลุมพินี', area: 'กรุงเทพฯ', meet: 'หน้าลานพระบรมราชานุสาวรีย์ ร.6' },
  { place: 'สวนเบญจกิติ', area: 'กรุงเทพฯ', meet: 'ลานหน้าอาคารพิพิธภัณฑ์ฝั่งถนนรัชดา' },
  { place: 'สวนจตุจักร', area: 'กรุงเทพฯ', meet: 'หน้าประตู 1 ฝั่ง MRT สวนจตุจักร' },
  { place: 'สวนรถไฟ', area: 'กรุงเทพฯ', meet: 'ลานจอดรถหน้าห้องน้ำโซน A' },
  { place: 'สวนหลวง ร.9', area: 'กรุงเทพฯ', meet: 'ประตู 2 ฝั่งถนนเฉลิมพระเกียรติ' },
  { place: 'สวนเสรีไทย', area: 'กรุงเทพฯ บึงกุ่ม', meet: 'ศาลาริมบึงด้านทางเข้าหลัก' },
  { place: 'อุทยาน 100 ปี จุฬาฯ', area: 'กรุงเทพฯ', meet: 'บันไดหน้าอาคารพิพิธภัณฑ์' },
  { place: 'ม.เกษตรศาสตร์ บางเขน', area: 'กรุงเทพฯ', meet: 'หน้าสนามอินทรีจันทรสถิตย์' },
  { place: 'ทางเดินริมน้ำ สะพานพระราม 8', area: 'กรุงเทพฯ', meet: 'ใต้สะพานฝั่งสวนสาธารณะพระราม 8' },
  { place: 'อ่างแก้ว มช.', area: 'เชียงใหม่', meet: 'หน้าลานจอดรถอ่างแก้ว' },
  { place: 'สะพานหิน', area: 'ภูเก็ต', meet: 'หน้าอนุสาวรีย์ตำนานเหมืองแร่' },
  { place: 'บึงแก่นนคร', area: 'ขอนแก่น', meet: 'ลานหน้าพระธาตุบึงแก่นนคร' },
  { place: 'หาดจอมเทียน', area: 'ชลบุรี พัทยา', meet: 'ป้ายจอมเทียนซอย 5 ฝั่งชายหาด' },
];
const TRACKS: Venue[] = [
  { place: 'สนามกีฬาจุฬาฯ (ลู่วิ่ง)', area: 'กรุงเทพฯ', meet: 'อัฒจันทร์ฝั่งทิศเหนือ' },
  { place: 'สนามกีฬาธูปะเตมีย์', area: 'กรุงเทพฯ', meet: 'ทางเข้าลู่วิ่งฝั่งถนนพหลโยธิน' },
  { place: 'สนามศุภชลาศัย', area: 'กรุงเทพฯ', meet: 'ประตู 3 ฝั่งถนนพระราม 1' },
];
const GYMS: Venue[] = [
  { place: 'ยิมฟังก์ชันนัล ซ.อารีย์ 4', area: 'กรุงเทพฯ', meet: 'หน้าเคาน์เตอร์ยิม (ค่าเข้ายิม 250 บาท)' },
  { place: 'ยิม CrossFit ทองหล่อ 10', area: 'กรุงเทพฯ', meet: 'โซน sled ชั้น 1 (ค่าเข้ายิม 300 บาท)' },
  { place: 'ยิมสาย HYROX อ่อนนุช', area: 'กรุงเทพฯ', meet: 'หน้าเคาน์เตอร์ (ค่าเข้ายิม 200 บาท)' },
  { place: 'ยิมฟังก์ชันนัล นิมมานฯ', area: 'เชียงใหม่', meet: 'หน้าเคาน์เตอร์ยิม (ค่าเข้ายิม 200 บาท)' },
];
const TRAILS: Venue[] = [
  { place: 'ดอยสุเทพ เส้นทางวัดผาลาด', area: 'เชียงใหม่', meet: 'ลานจอดรถหน้าสวนสัตว์เชียงใหม่' },
  { place: 'เขาใหญ่ เส้นทางผากล้วยไม้', area: 'นครราชสีมา', meet: 'ศูนย์บริการนักท่องเที่ยวเขาใหญ่' },
  { place: 'เขาชีจรรย์ เส้นทางรอบเขา', area: 'ชลบุรี', meet: 'ลานจอดรถหน้าเขาชีจรรย์' },
  { place: 'เขารัง เส้นทางป่า', area: 'ภูเก็ต', meet: 'จุดชมวิวเขารัง' },
];

// Pace per km and a typical distance multiplier by level.
const PACE: Record<PartyLevel, string> = {
  beginner: '7:30–8:30', intermediate: '6:00–6:45', advanced: '5:00–5:30', elite: '4:10–4:40', all: 'แบ่งกลุ่มเพซ 5:30 / 6:30 / 7:30',
};
const SCALE: Record<PartyLevel, number> = { beginner: 0.5, intermediate: 0.75, advanced: 1, elite: 1.25, all: 0.6 };
const km = (base: number, level: PartyLevel) => Math.max(3, Math.round(base * SCALE[level]));

type Slot = { hour: number; minute: number };
type Session = {
  style: PartyStyle;
  type: string;
  venues: Venue[];
  slots: { weekday: Slot[]; weekend: Slot[] };
  weekendOnly?: boolean;
  capacity: [number, number];
  levels: PartyLevel[];
  build: (level: PartyLevel, venue: Venue, pick: <T>(items: T[]) => T) => { title: string; description: string };
};

const EARLY: Slot[] = [{ hour: 5, minute: 30 }, { hour: 6, minute: 0 }];
const EVENING: Slot[] = [{ hour: 18, minute: 0 }, { hour: 18, minute: 30 }, { hour: 19, minute: 0 }];
const WEEKEND_AM: Slot[] = [{ hour: 6, minute: 0 }, { hour: 6, minute: 30 }, { hour: 7, minute: 0 }];

const SESSIONS: Session[] = [
  {
    style: 'easy', type: 'Running', venues: PARKS, capacity: [6, 12], levels: ['beginner', 'beginner', 'intermediate', 'all', 'all'],
    slots: { weekday: [...EARLY, ...EVENING], weekend: WEEKEND_AM },
    build: (level, venue, pick) => {
      const distance = km(8, level);
      return {
        title: pick([
          `Easy run ${venue.place} ${distance} กม.`,
          `วิ่งชิล คุยกันได้ ${distance} กม.`,
          level === 'beginner' ? 'วิ่งมือใหม่ ไม่ทิ้งกัน วิ่งสลับเดินได้' : `Zone 2 วิ่งเบา ๆ ${distance} กม.`,
          `Recovery run หลังลงแข่ง ${distance} กม.`,
        ]),
        description: `เพซ ${PACE[level]} นาที/กม. วิ่งสบาย ๆ ${distance} กม. ไม่มีใครถูกทิ้ง มีคนปิดท้ายกลุ่ม จุดนัด: ${venue.meet} วอร์มอัพพร้อมกัน 10 นาที แล้วยืดเหยียดหลังวิ่ง`,
      };
    },
  },
  {
    style: 'long', type: 'Running', venues: PARKS, capacity: [5, 10], levels: ['beginner', 'intermediate', 'intermediate', 'advanced', 'elite'], weekendOnly: true,
    slots: { weekday: [], weekend: [{ hour: 5, minute: 0 }, { hour: 5, minute: 30 }] },
    build: (level, venue, pick) => {
      const distance = km(22, level);
      return {
        title: pick([`Long run ${distance} กม. สะสมระยะ`, `LSD ${distance} กม. เตรียมฮาล์ฟ`, `ซ้อมยาว ${distance} กม. วันอาทิตย์`]),
        description: `วิ่งยาว ${distance} กม. เพซ ${PACE[level]} นาที/กม. ตั้งจุดน้ำทุก 5 กม. (ช่วยกันออกค่าน้ำคนละ 40 บาท) แนะนำให้พกเจลมาเอง จุดนัด: ${venue.meet}`,
      };
    },
  },
  {
    style: 'interval', type: 'Running', venues: TRACKS, capacity: [4, 8], levels: ['intermediate', 'advanced', 'advanced', 'elite'],
    slots: { weekday: EVENING, weekend: WEEKEND_AM },
    build: (level, venue, pick) => ({
      title: pick(['Interval 6 × 800 ม. ที่ลู่', 'Interval 10 × 400 ม.', 'Interval 5 × 1 กม. ลดเวลา 5K', 'Pyramid 200-400-800-400-200']),
      description: `วอร์มอัพ 2 กม. แล้วเข้าเซ็ต พักจ๊อก 90 วินาที เพซเซ็ตประมาณ ${level === 'elite' ? '3:30–3:50' : level === 'advanced' ? '4:10–4:30' : '5:00–5:20'} นาที/กม. แบ่งกลุ่มตามเพซ ไม่ต้องกลัวตาม จุดนัด: ${venue.meet}`,
    }),
  },
  {
    style: 'tempo', type: 'Running', venues: PARKS, capacity: [4, 8], levels: ['beginner', 'intermediate', 'intermediate', 'advanced'],
    slots: { weekday: [...EARLY, ...EVENING], weekend: WEEKEND_AM },
    build: (level, venue, pick) => {
      const distance = km(8, level);
      return {
        title: pick([`Tempo run ${distance} กม.`, `Fartlek 40 นาที`, `Progression run ${distance} กม. เร่งทีละกิโล`]),
        description: `ซ้อมเพิ่มความเร็ว เริ่มเพซ ${PACE[level]} แล้วค่อยเร่งช่วงท้าย เหมาะกับคนอยากลดเวลา 5K/10K มีคนช่วยลากเพซ จุดนัด: ${venue.meet}`,
      };
    },
  },
  {
    style: 'hyrox', type: 'HYROX', venues: GYMS, capacity: [4, 8], levels: ['beginner', 'intermediate', 'intermediate', 'advanced', 'elite'],
    slots: { weekday: EVENING, weekend: [{ hour: 8, minute: 0 }, { hour: 9, minute: 0 }] },
    build: (level, venue, pick) => ({
      title: pick(
        level === 'beginner'
          ? ['HYROX มือใหม่ ลองครบ 8 สถานี', 'HYROX Doubles มือใหม่ หาคู่ซ้อม']
          : ['HYROX Simulation ครึ่งสนาม', 'Compromised running 8 × 1 กม. + สถานี', 'HYROX Doubles ซ้อม Wall ball + Sled', 'Sled push / pull + Burpee broad jump'],
      ),
      description: `${level === 'beginner' ? 'สอนท่าและน้ำหนักทีละสถานี ใช้น้ำหนักเบากว่าสนามจริงได้' : 'ใช้น้ำหนักตามรุ่น Open/Pro จับเวลาเหมือนสนามจริง'} วิ่ง 1 กม. สลับสถานี จับคู่ตามเลเวล จุดนัด: ${venue.meet}`,
    }),
  },
  {
    style: 'trail', type: 'Trail', venues: TRAILS, capacity: [4, 10], levels: ['intermediate', 'advanced', 'advanced', 'all'], weekendOnly: true,
    slots: { weekday: [], weekend: [{ hour: 5, minute: 30 }, { hour: 6, minute: 0 }] },
    build: (level, venue) => {
      const distance = km(16, level);
      return {
        title: `เทรล${venue.place} ${distance} กม.`,
        description: `วิ่งเทรล ${distance} กม. ขึ้นเขาเดินได้ ลงเขาค่อย ๆ ไป ต้องใช้รองเท้าเทรลและพกน้ำอย่างน้อย 1 ลิตร มีรถรับส่งกลับจุดนัด (หารค่ารถ) จุดนัด: ${venue.meet}`,
      };
    },
  },
];

// Small seeded PRNG (mulberry32) so mock data is stable across reloads.
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353), h = (h << 13) | (h >>> 19);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dateKey = (date: Date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
const membersAt = (level: PartyLevel) => MOCK_MEMBERS.filter(member => level === 'all' || member.levelId === level);
const asParticipant = (member: (typeof MOCK_MEMBERS)[number]): PartyParticipant => ({ id: member.id, name: member.displayName, levelId: member.levelId });

function partiesOn(day: Date): EventRecord[] {
  const key = dateKey(day);
  const random = seededRandom(key);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  // Weekends lean towards long runs and trail, like real running clubs.
  const sessions = isWeekend ? SESSIONS.flatMap(session => (session.weekendOnly ? [session, session, session] : [session])) : SESSIONS.filter(session => !session.weekendOnly);
  const usedPlaces = new Set<string>();
  const count = isWeekend ? 3 + Math.floor(random() * 3) : 1 + Math.floor(random() * 3);

  return Array.from({ length: count }, (_, index) => {
    const session = pick(sessions);
    const level = pick(session.levels);
    // Avoid two parties at the same venue on the same day.
    const freeVenues = session.venues.filter(venue => !usedPlaces.has(venue.place));
    const venue = pick(freeVenues.length ? freeVenues : session.venues);
    usedPlaces.add(venue.place);
    const slot = pick(isWeekend ? session.slots.weekend : session.slots.weekday);
    const { title, description } = session.build(level, venue, pick);
    const capacity = session.capacity[0] + Math.floor(random() * (session.capacity[1] - session.capacity[0] + 1));
    const pool = membersAt(level);
    const host = pick(pool);
    // Roughly one party in six is already full; the rest are partly filled.
    const others = MOCK_MEMBERS.filter(member => member.id !== host.id && (level === 'all' || member.levelId === level)).sort(() => random() - 0.5);
    const joined = random() < 0.16 ? capacity - 1 : Math.floor(random() * Math.min(capacity - 1, others.length + 1));
    const date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), slot.hour, slot.minute);
    return {
      id: `p-seed-${key}-${index + 1}`,
      title,
      type: session.type,
      style: session.style,
      date: date.toISOString(),
      location: `${venue.place}, ${venue.area}`,
      description,
      status: 'published',
      organizer: { id: host.id, name: host.displayName, avatarUrl: null },
      hostUserId: host.id,
      visibility: 'public',
      joinUrl: null,
      isParty: true,
      levelId: level,
      capacity,
      participants: [asParticipant(host), ...others.slice(0, joined).map(asParticipant)],
    };
  });
}

export function buildMockParties(now = new Date()): EventRecord[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Array.from({ length: DAYS_BACK + DAYS_AHEAD + 1 }, (_, offset) => {
    const day = new Date(today);
    day.setDate(today.getDate() + offset - DAYS_BACK);
    return partiesOn(day);
  }).flat();
}
