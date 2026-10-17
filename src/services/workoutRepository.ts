import type { OnboardingData, UserId } from '../types/models';
import { effortFromOnboarding, fiveKEquivalent, type WorkoutEffort } from '../utils/leveling';

// Mock persistence for logged runs, one list per user in localStorage.
export interface Workout extends WorkoutEffort {
  id: string;
  date: string; // YYYY-MM-DD
  source: 'onboarding' | 'log';
  createdAt: string;
}

type WorkoutStorage = Pick<Storage, 'getItem' | 'setItem'>;
const workoutsKey = (userId: UserId) => `lowrox:workouts:${userId}`;
const newId = () => `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const toDateKey = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const byDateDesc = (a: Workout, b: Workout) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

function write(userId: UserId, workouts: Workout[], storage: WorkoutStorage) {
  storage.setItem(workoutsKey(userId), JSON.stringify(workouts));
  return [...workouts].sort(byDateDesc);
}

// Newest first. The first read seeds the run reported in onboarding, so a new user starts with a level.
export function listWorkouts(userId: UserId, onboardingData?: OnboardingData, storage: WorkoutStorage = localStorage): Workout[] {
  const raw = storage.getItem(workoutsKey(userId));
  if (raw) return (JSON.parse(raw) as Workout[]).sort(byDateDesc);

  const baseline = effortFromOnboarding(onboardingData?.fitnessLevel);
  if (!baseline) return [];
  const now = new Date();
  return write(userId, [{ id: newId(), ...baseline, date: toDateKey(now), source: 'onboarding', createdAt: now.toISOString() }], storage);
}

export function addWorkout(userId: UserId, input: WorkoutEffort & { date: string }, storage: WorkoutStorage = localStorage) {
  const current = listWorkouts(userId, undefined, storage);
  const workout: Workout = { id: newId(), ...input, source: 'log', createdAt: new Date().toISOString() };
  return { workout, workouts: write(userId, [workout, ...current], storage) };
}

export function deleteWorkout(userId: UserId, workoutId: string, storage: WorkoutStorage = localStorage) {
  return write(userId, listWorkouts(userId, undefined, storage).filter(item => item.id !== workoutId), storage);
}

// Level uses the best effort of the last 60 days, so one off day never drops it.
export function bestRecentWorkout(workouts: Workout[], now = new Date(), windowDays = 60) {
  const cutoff = toDateKey(new Date(now.getTime() - windowDays * 86400000));
  const recent = workouts.filter(item => item.date >= cutoff);
  const pool = recent.length ? recent : workouts;
  return pool.reduce<Workout | null>((best, item) => (!best || fiveKEquivalent(item) < fiveKEquivalent(best) ? item : best), null);
}

// Weekly plan check-offs, reset automatically each Monday.
const planKey = (userId: UserId) => `lowrox:plan-done:${userId}`;
export function weekKey(now = new Date()) {
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return toDateKey(monday);
}

export function readPlanDone(userId: UserId, now = new Date(), storage: WorkoutStorage = localStorage): string[] {
  const saved = JSON.parse(storage.getItem(planKey(userId)) || 'null') as { week: string; ids: string[] } | null;
  return saved?.week === weekKey(now) ? saved.ids : [];
}

export function togglePlanDone(userId: UserId, sessionId: string, now = new Date(), storage: WorkoutStorage = localStorage) {
  const current = readPlanDone(userId, now, storage);
  const ids = current.includes(sessionId) ? current.filter(id => id !== sessionId) : [...current, sessionId];
  storage.setItem(planKey(userId), JSON.stringify({ week: weekKey(now), ids }));
  return ids;
}
