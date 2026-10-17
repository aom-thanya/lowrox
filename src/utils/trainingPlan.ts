import type { LevelSummary } from './leveling';
import { formatDuration } from './leveling';

export interface PlanSession {
  id: string;
  title: string;
  detail: string;
  paceHint?: string;
  intensity: 'easy' | 'hard';
  videoUrl: string;
  adjusted?: boolean;
}

type SessionTemplate = Omit<PlanSession, 'id' | 'paceHint' | 'videoUrl'> & { pace?: 'easy' | 'tempo' | 'interval'; video: string };

const youtube = (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

// Three sessions a week per level, ordered easiest first. Placeholder content until coaches supply plans.
const PLANS: SessionTemplate[][] = [
  [
    { title: 'วิ่งสลับเดิน 30 นาที', detail: 'วิ่ง 2 นาที สลับเดิน 1 นาที ทำ 10 รอบ', intensity: 'easy', pace: 'easy', video: 'วิ่งสลับเดิน มือใหม่' },
    { title: 'Easy run 20 นาที', detail: 'วิ่งช้า ๆ ระดับที่ยังพูดคุยได้ ไม่หอบ', intensity: 'easy', pace: 'easy', video: 'easy run zone 2 วิ่งช้า' },
    { title: 'Functional strength 20 นาที', detail: 'Squat, Lunge, Wall ball เบา ๆ อย่างละ 3 เซ็ต', intensity: 'hard', video: 'HYROX beginner strength workout' },
  ],
  [
    { title: 'Easy run 30 นาที', detail: 'วิ่งต่อเนื่องสบาย ๆ เพื่อสร้างฐานความอึด', intensity: 'easy', pace: 'easy', video: 'easy run zone 2' },
    { title: 'Interval 6 × 400 ม.', detail: 'วิ่งเร็ว 400 ม. พักเดิน 90 วินาที', intensity: 'hard', pace: 'interval', video: 'interval 400m running workout' },
    { title: 'HYROX strength 30 นาที', detail: 'Wall ball, Sandbag lunge, Burpee broad jump', intensity: 'hard', video: 'HYROX strength workout' },
  ],
  [
    { title: 'Tempo run 20 นาที', detail: 'วิ่งเร็วแบบคุมได้ หายใจแรงแต่ไม่หมดแรง', intensity: 'hard', pace: 'tempo', video: 'tempo run workout' },
    { title: 'Interval 5 × 1 กม.', detail: 'วิ่ง 1 กม. พักจ๊อก 2 นาที', intensity: 'hard', pace: 'interval', video: '1km interval running workout' },
    { title: 'HYROX simulation', detail: '4 รอบ: วิ่ง 1 กม. + สถานีละ 1 อย่าง', intensity: 'hard', video: 'HYROX simulation workout' },
  ],
  [
    { title: 'Threshold 2 × 15 นาที', detail: 'วิ่งที่ pace threshold พัก 3 นาที', intensity: 'hard', pace: 'tempo', video: 'threshold run workout' },
    { title: 'Interval 8 × 800 ม.', detail: 'วิ่ง 800 ม. พักจ๊อก 90 วินาที', intensity: 'hard', pace: 'interval', video: '800m repeats workout' },
    { title: 'Long run 16 กม.', detail: 'วิ่งยาวสบาย ๆ เน้นจบระยะ', intensity: 'easy', pace: 'easy', video: 'long run tips' },
  ],
];

const PACE_FACTORS = { easy: 1.25, tempo: 1.05, interval: 0.95 } as const;

// Weekly plan for the runner's level. Without a level yet, the Beginner plan applies.
// With health concerns, hard sessions are swapped for an easy run.
export function buildWeeklyPlan(summary: LevelSummary | null, hasHealthConcerns: boolean): PlanSession[] {
  const index = summary?.index ?? 0;
  const fiveKPace = summary ? summary.fiveKMinutes / 5 : null;
  return PLANS[index].map((template, position) => {
    const id = `${index}-${position}`;
    if (hasHealthConcerns && template.intensity === 'hard') {
      return {
        id,
        title: 'Easy run 25 นาที',
        detail: `ปรับจาก "${template.title}" ให้เบาลง เพราะคุณแจ้งข้อจำกัดด้านสุขภาพไว้`,
        paceHint: fiveKPace ? `ประมาณ ${formatDuration(fiveKPace * PACE_FACTORS.easy)} /กม.` : undefined,
        intensity: 'easy',
        videoUrl: youtube('easy run zone 2'),
        adjusted: true,
      };
    }
    return {
      id,
      title: template.title,
      detail: template.detail,
      paceHint: fiveKPace && template.pace ? `ประมาณ ${formatDuration(fiveKPace * PACE_FACTORS[template.pace])} /กม.` : undefined,
      intensity: template.intensity,
      videoUrl: youtube(template.video),
    };
  });
}
