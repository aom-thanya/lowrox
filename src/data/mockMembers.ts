import type { LevelId } from '../utils/leveling';

// Mock community members: hosts and participants of seeded parties. Replace with an API.
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
  { id: 'm9', displayName: 'แพร', levelId: 'beginner', goalType: 'increase_distance', goalLabel: 'จบมินิมาราธอนแรก', timePresets: ['early_morning'], areaLabel: 'สวนหลวง ร.9', bio: 'พนักงานออฟฟิศ เริ่มวิ่งเพื่อลดน้ำหนัก', autoAccept: true },
  { id: 'm10', displayName: 'กอล์ฟ', levelId: 'beginner', goalType: 'recommend_for_me', goalLabel: 'วิ่งให้ต่อเนื่องสัปดาห์ละ 3 วัน', timePresets: ['after_work'], areaLabel: 'สวนเสรีไทย', bio: 'เคยเตะบอล กลับมาออกกำลังใหม่', autoAccept: true },
  { id: 'm11', displayName: 'นุ่น', levelId: 'beginner', goalType: 'improve_time', goalLabel: 'วิ่ง 5 กม. ไม่หยุดเดิน', timePresets: ['evening'], areaLabel: 'สวนรถไฟ', bio: 'วิ่งกับแฟน แต่แฟนวิ่งเร็วกว่า เลยอยากมีกลุ่ม', autoAccept: true },
  { id: 'm12', displayName: 'ภูมิ', levelId: 'intermediate', goalType: 'increase_distance', goalLabel: 'ลงฮาล์ฟมาราธอนต้นปี', timePresets: ['early_morning'], areaLabel: 'ม.เกษตรศาสตร์', bio: 'วิ่งมา 2 ปี ชอบ long run วันอาทิตย์', autoAccept: true },
  { id: 'm13', displayName: 'ไอซ์', levelId: 'intermediate', goalType: 'prepare_event', goalLabel: 'ลง HYROX Open ครั้งแรก', timePresets: ['after_work'], areaLabel: 'อารีย์', bio: 'สาย CrossFit หันมาซ้อมวิ่งให้จริงจังขึ้น', autoAccept: true },
  { id: 'm14', displayName: 'เบส', levelId: 'advanced', goalType: 'improve_time', goalLabel: 'ฮาล์ฟให้ต่ำกว่า 1:40', timePresets: ['early_morning', 'evening'], areaLabel: 'สนามกีฬาจุฬาฯ', bio: 'โค้ชวิ่งพาร์ทไทม์ ชอบพาซ้อมที่ลู่', autoAccept: false },
  { id: 'm15', displayName: 'เมย์', levelId: 'advanced', goalType: 'prepare_event', goalLabel: 'เตรียมลง HYROX Pro', timePresets: ['early_morning'], areaLabel: 'ทองหล่อ', bio: 'ซ้อม HYROX มา 2 ซีซัน ชอบ sled push', autoAccept: false },
  { id: 'm16', displayName: 'ต่อ', levelId: 'elite', goalType: 'improve_time', goalLabel: 'มาราธอน Sub 3', timePresets: ['early_morning'], areaLabel: 'สวนลุมพินี', bio: 'วิ่งมาราธอนมาแล้ว 12 สนาม', autoAccept: false },
  { id: 'm17', displayName: 'ดาว', levelId: 'intermediate', goalType: 'improve_endurance', goalLabel: 'วิ่งเทรล 25 กม.', timePresets: ['early_morning'], areaLabel: 'เชียงใหม่', bio: 'อยู่เชียงใหม่ ขึ้นดอยสุเทพทุกเสาร์', autoAccept: true },
  { id: 'm18', displayName: 'ฟิล์ม', levelId: 'beginner', goalType: 'buddy_event', goalLabel: 'ลอง HYROX แบบ Doubles', timePresets: ['evening'], areaLabel: 'อ่อนนุช', bio: 'เพิ่งเข้ายิมได้ครึ่งปี อยากลองของใหม่', autoAccept: true },
  { id: 'm19', displayName: 'เอิร์ธ', levelId: 'advanced', goalType: 'improve_endurance', goalLabel: 'ลงอัลตร้าเทรล 50 กม.', timePresets: ['early_morning'], areaLabel: 'ภูเก็ต', bio: 'วิ่งเทรลภูเก็ต ชอบเนินโหด ๆ', autoAccept: true },
  { id: 'm20', displayName: 'ปั้น', levelId: 'elite', goalType: 'prepare_event', goalLabel: 'HYROX Elite 15', timePresets: ['early_morning', 'after_work'], areaLabel: 'สุขุมวิท', bio: 'อดีตนักฟุตบอล ตอนนี้ซ้อม HYROX เต็มเวลา', autoAccept: false },
];

export const findMockMember = (id: string) => MOCK_MEMBERS.find(member => member.id === id) ?? null;
