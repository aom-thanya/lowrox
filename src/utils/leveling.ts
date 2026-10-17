import type { FitnessLevel } from '../types/models';

// Levels are judged on a 5 km-equivalent running time (minutes).
// Thresholds are provisional until the coaching team defines official ones.
export type LevelId = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export interface Level { id: LevelId; label: string; slowest: number; fastest: number }

export const LEVELS: Level[] = [
  { id: 'beginner', label: 'Beginner', slowest: 60, fastest: 40 },
  { id: 'intermediate', label: 'Intermediate', slowest: 40, fastest: 30 },
  { id: 'advanced', label: 'Advanced', slowest: 30, fastest: 25 },
  { id: 'elite', label: 'Elite', slowest: 25, fastest: 20 },
];

export interface WorkoutEffort { distanceKm: number; durationMin: number }

// Riegel's formula: predicts the time over another distance from one performance.
export function fiveKEquivalent({ distanceKm, durationMin }: WorkoutEffort) {
  return durationMin * Math.pow(5 / distanceKm, 1.06);
}

// Hitting a band's fastest time exactly counts as reaching the next level.
export function levelIndexFor(fiveKMinutes: number) {
  const index = LEVELS.findIndex(level => fiveKMinutes > level.fastest);
  return index === -1 ? LEVELS.length - 1 : index;
}

export interface LevelSummary {
  level: Level;
  index: number;
  fiveKMinutes: number;
  // 0–1, how far through the current level band the runner is.
  progress: number;
  next: Level | null;
  // Minutes still to cut from the 5 km time to reach the next level.
  minutesToNext: number;
}

export function summarizeLevel(fiveKMinutes: number): LevelSummary {
  const index = levelIndexFor(fiveKMinutes);
  const level = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const span = level.slowest - level.fastest;
  const progress = Math.min(1, Math.max(0, (level.slowest - fiveKMinutes) / span));
  return { level, index, fiveKMinutes, progress, next, minutesToNext: next ? Math.max(0, fiveKMinutes - level.fastest) : 0 };
}

// Midpoints for the duration ranges offered in onboarding step 2.
const DURATION_PRESET_MINUTES: Record<string, number> = { under_30: 27, '30_45': 38, '46_60': 53, over_60: 70 };

// The run reported during onboarding, or null when the user skipped timing it.
export function effortFromOnboarding(fitness: FitnessLevel | undefined): WorkoutEffort | null {
  if (!fitness) return null;
  const distanceKm = Number(fitness.runningDistance);
  const durationMin = Number(fitness.runningDuration) || DURATION_PRESET_MINUTES[fitness.durationSelection] || 0;
  return isPlausibleEffort({ distanceKm, durationMin }) ? { distanceKm, durationMin } : null;
}

export function isPlausibleEffort({ distanceKm, durationMin }: WorkoutEffort) {
  if (!(distanceKm >= 0.5 && distanceKm <= 100) || !(durationMin > 0)) return false;
  // Faster than ~2:30 min/km is beyond world-record pace for these distances.
  return durationMin / distanceKm >= 2.5;
}

// "52:30" or "1:05:00"
export function formatDuration(totalMinutes: number) {
  const totalSeconds = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mmss = `${String(minutes).padStart(hours ? 2 : 1, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours ? `${hours}:${mmss}` : mmss;
}

export const formatPace = (effort: WorkoutEffort) => formatDuration(effort.durationMin / effort.distanceKm);
export const formatDistance = (km: number) => `${Number(km.toFixed(2))} กม.`;
