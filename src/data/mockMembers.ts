import type { LevelId } from '../utils/leveling';

// Mock community members: hosts of seeded parties and buddy candidates. Replace with an API.
export interface MockMember {
  id: string;
  displayName: string;
  levelId: LevelId;
  goalType: string;
  goalLabel: string;
  timePresets: string[];
  areaLabel: string;
  bio: string;
  // Mock behaviour: accepts buddy requests right away instead of staying pending.
  autoAccept: boolean;
}

export const MOCK_MEMBERS: MockMember[] = [
  { id: 'm1', displayName: 'ต้น', levelId: 'intermediate', goalType: 'buddy_event', goalLabel: 'หาคู่ลง HYROX Doubles', timePresets: ['early_morning'], areaLabel: 'สวนลุมพินี', bio: 'ซ้อม HYROX มา 6 เดือน หาคู่ลง Doubles ปลายปี', autoAccept: true },
  { id: 'm2', displayName: 'บีม', levelId: 'intermediate', goalType: 'improve_time', goalLabel: 'วิ่ง 5 กม. ให้ต่ำกว่า 30 นาที', timePresets: ['after_work'], areaLabel: 'สวนเบญจกิติ', bio: 'สายวิ่งหลังเลิกงาน ชอบ interval', autoAccept: true },
  { id: 'm3', displayName: 'จูน', levelId: 'beginner', goalType: 'increase_distance', goalLabel: 'วิ่งให้ถึง 10 กม.', timePresets: ['morning', 'early_morning'], areaLabel: 'สวนจตุจักร', bio: 'เพิ่งเริ่มวิ่งได้ 3 เดือน ไม่รีบ เน้นสนุก', autoAccept: true },
  { id: 'm4', displayName: 'ปาล์ม', levelId: 'advanced', goalType: 'prepare_event', goalLabel: 'เตรียมลง HYROX Bangkok', timePresets: ['early_morning'], areaLabel: 'สวนลุมพินี', bio: 'ซ้อมจริงจัง 5 วันต่อสัปดาห์', autoAccept: false },
  { id: 'm5', displayName: 'มิ้นท์', levelId: 'beginner', goalType: 'buddy_event', goalLabel: 'หาบัดดี้ลงงานวิ่งแรก', timePresets: ['after_work', 'evening'], areaLabel: 'อารีย์', bio: 'อยากมีเพื่อนวิ่งด้วยกัน จะได้ไม่ขี้เกียจ', autoAccept: true },
  { id: 'm6', displayName: 'เจ', levelId: 'intermediate', goalType: 'buddy_event', goalLabel: 'หาคู่ลง HYROX Doubles', timePresets: ['early_morning', 'after_work'], areaLabel: 'สวนรถไฟ', bio: 'สาย functional fitness ชอบ wall ball', autoAccept: true },
  { id: 'm7', displayName: 'ฟ้า', levelId: 'elite', goalType: 'prepare_event', goalLabel: 'ทำเวลา HYROX ให้ต่ำกว่า 70 นาที', timePresets: ['early_morning'], areaLabel: 'สวนลุมพินี', bio: 'อดีตนักกรีฑา ตอนนี้ซ้อม HYROX', autoAccept: false },
  { id: 'm8', displayName: 'โอ๊ต', levelId: 'advanced', goalType: 'improve_endurance', goalLabel: 'เพิ่มความอึด', timePresets: ['evening'], areaLabel: 'บางนา', bio: 'วิ่งเทรลเป็นงานอดิเรก', autoAccept: true },
];

export const findMockMember = (id: string) => MOCK_MEMBERS.find(member => member.id === id) ?? null;
