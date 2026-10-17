import { describe, expect, test } from 'vitest';
import { effortFromOnboarding, fiveKEquivalent, formatDuration, isPlausibleEffort, summarizeLevel } from '../src/utils/leveling';
import { addWorkout, bestRecentWorkout, listWorkouts, readPlanDone, togglePlanDone } from '../src/services/workoutRepository';
import { buildWeeklyPlan } from '../src/utils/trainingPlan';
import { createInitialOnboardingData } from '../src/context/OnboardingContext';

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

describe('leveling', () => {
  test('levels follow 5 km time bands', () => {
    expect(summarizeLevel(60).level.id).toBe('beginner');
    expect(summarizeLevel(40).level.id).toBe('intermediate');
    expect(summarizeLevel(29.9).level.id).toBe('advanced');
    expect(summarizeLevel(22).level.id).toBe('elite');
  });

  test('summary reports progress and the gap to the next level', () => {
    const summary = summarizeLevel(50); // Beginner band is 60 → 40
    expect(summary.progress).toBeCloseTo(0.5);
    expect(summary.next?.id).toBe('intermediate');
    expect(summary.minutesToNext).toBeCloseTo(10);
    expect(summarizeLevel(22).next).toBeNull();
  });

  test('other distances convert to a 5 km equivalent', () => {
    expect(fiveKEquivalent({ distanceKm: 5, durationMin: 30 })).toBeCloseTo(30);
    expect(fiveKEquivalent({ distanceKm: 10, durationMin: 60 })).toBeLessThan(30);
  });

  test('implausible efforts are rejected', () => {
    expect(isPlausibleEffort({ distanceKm: 5, durationMin: 10 })).toBe(false);
    expect(isPlausibleEffort({ distanceKm: 0, durationMin: 30 })).toBe(false);
    expect(isPlausibleEffort({ distanceKm: 5, durationMin: 32 })).toBe(true);
  });

  test('onboarding answers become a baseline, including duration ranges', () => {
    const data = createInitialOnboardingData();
    expect(effortFromOnboarding(data.fitnessLevel)).toBeNull();
    expect(effortFromOnboarding({ ...data.fitnessLevel, runningDistance: '5', durationSelection: '30_45' })).toEqual({ distanceKm: 5, durationMin: 38 });
    expect(effortFromOnboarding({ ...data.fitnessLevel, runningDistance: '3', runningDuration: '20' })).toEqual({ distanceKm: 3, durationMin: 20 });
  });

  test('formatDuration prints m:ss and h:mm:ss', () => {
    expect(formatDuration(52.5)).toBe('52:30');
    expect(formatDuration(65)).toBe('1:05:00');
  });
});

describe('workoutRepository', () => {
  test('first read seeds the onboarding run, later logs are kept newest first', () => {
    const storage = memoryStorage();
    const data = createInitialOnboardingData();
    data.fitnessLevel = { ...data.fitnessLevel, runningDistance: '5', runningDuration: '52' };

    const seeded = listWorkouts('u1', data, storage);
    expect(seeded).toHaveLength(1);
    expect(seeded[0]).toMatchObject({ source: 'onboarding', distanceKm: 5, durationMin: 52 });

    const { workouts } = addWorkout('u1', { distanceKm: 5, durationMin: 38, date: '2999-01-01' }, storage);
    expect(workouts[0].durationMin).toBe(38);
    expect(bestRecentWorkout(workouts)?.durationMin).toBe(38);
  });

  test('plan check-offs reset each week', () => {
    const storage = memoryStorage();
    const monday = new Date('2026-10-12T09:00:00');
    expect(togglePlanDone('u1', '0-0', monday, storage)).toEqual(['0-0']);
    expect(readPlanDone('u1', new Date('2026-10-18T09:00:00'), storage)).toEqual(['0-0']);
    expect(readPlanDone('u1', new Date('2026-10-19T09:00:00'), storage)).toEqual([]);
  });
});

describe('trainingPlan', () => {
  test('hard sessions are swapped for easy runs when the runner reported health concerns', () => {
    const summary = summarizeLevel(35);
    const normal = buildWeeklyPlan(summary, false);
    const adjusted = buildWeeklyPlan(summary, true);
    expect(normal.some(session => session.intensity === 'hard')).toBe(true);
    expect(adjusted.every(session => session.intensity === 'easy')).toBe(true);
    expect(adjusted.some(session => session.adjusted)).toBe(true);
  });
});
