import type { OnboardingData } from '../types/models';
import type { MockMember } from '../data/mockMembers';
import { LEVELS, type LevelId } from './leveling';

export interface MatchProfile {
  levelId: LevelId | null;
  goalType: string;
  timePresets: string[];
  areaLabels: string[];
}

export interface BuddyMatch { member: MockMember; score: number; reasons: string[] }

const TIME_LABELS: Record<string, string> = {
  early_morning: 'เช้าตรู่', morning: 'ช่วงเช้า', midday: 'กลางวัน', after_work: 'หลังเลิกงาน', evening: 'ช่วงค่ำ',
};
// Goals that mean "I want a race partner".
const RACE_GOALS = ['buddy_event', 'prepare_event'];

export function matchProfileFrom(levelId: LevelId | null, onboarding?: OnboardingData): MatchProfile {
  const windows = onboarding?.availabilityWindows ?? [];
  return {
    levelId,
    goalType: onboarding?.goals?.[0]?.goalType ?? '',
    timePresets: windows.flatMap(window => window.timePresets),
    areaLabels: windows.map(window => window.areaLabel.trim()).filter(Boolean),
  };
}

// Weighted score out of 100: level 40, goal 25, time 20, area 15. Reasons explain the score in plain words.
export function scoreBuddy(me: MatchProfile, member: MockMember): BuddyMatch {
  let score = 0;
  const reasons: string[] = [];

  const myIndex = LEVELS.findIndex(level => level.id === me.levelId);
  const theirIndex = LEVELS.findIndex(level => level.id === member.levelId);
  if (myIndex === -1) score += 20;
  else if (myIndex === theirIndex) { score += 40; reasons.push('เลเวลเดียวกัน'); }
  else if (Math.abs(myIndex - theirIndex) === 1) { score += 20; reasons.push('เลเวลใกล้กัน'); }

  if (me.goalType && me.goalType === member.goalType) { score += 25; reasons.push('เป้าหมายเดียวกัน'); }
  else if (RACE_GOALS.includes(me.goalType) && RACE_GOALS.includes(member.goalType)) { score += 15; reasons.push('อยากลงแข่งเหมือนกัน'); }

  const sharedTime = me.timePresets.includes('anytime') ? member.timePresets[0] : member.timePresets.find(time => me.timePresets.includes(time));
  if (sharedTime) { score += 20; reasons.push(`ว่าง${TIME_LABELS[sharedTime] ?? 'ช่วงเดียวกัน'}เหมือนกัน`); }

  if (me.areaLabels.some(area => area.includes(member.areaLabel) || member.areaLabel.includes(area))) {
    score += 15;
    reasons.push(`ซ้อมแถว${member.areaLabel}`);
  }

  return { member, score: Math.min(100, score), reasons };
}

export function rankBuddies(me: MatchProfile, members: MockMember[]) {
  return members.map(member => scoreBuddy(me, member)).sort((a, b) => b.score - a.score);
}
