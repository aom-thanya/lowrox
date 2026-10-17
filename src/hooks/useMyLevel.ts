import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addWorkout, bestRecentWorkout, deleteWorkout, listWorkouts, type Workout } from '../services/workoutRepository';
import { fiveKEquivalent, summarizeLevel, type LevelSummary, type WorkoutEffort } from '../utils/leveling';

const summarize = (workouts: Workout[]): LevelSummary | null => {
  const best = bestRecentWorkout(workouts);
  return best ? summarizeLevel(fiveKEquivalent(best)) : null;
};

// The signed-in runner's workouts and current level. Used by the level page, party creation and buddy matching.
export function useMyLevel() {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState(() => ({
    userId,
    workouts: userId != null ? listWorkouts(userId, user?.onboardingData) : []
  }));
  // Reload when the signed-in account changes.
  const workouts = state.userId === userId ? state.workouts : (userId != null ? listWorkouts(userId, user?.onboardingData) : []);
  if (state.userId !== userId) setState({ userId, workouts });

  const summary = useMemo(() => summarize(workouts), [workouts]);
  const hasHealthConcerns = Boolean(user?.onboardingData?.safetyCheck?.concerns?.length);

  // Returns the level before and after, so callers can celebrate a level-up.
  const logWorkout = useCallback((input: WorkoutEffort & { date: string }) => {
    if (userId == null) throw new Error('Not authenticated');
    const before = summarize(workouts);
    const result = addWorkout(userId, input);
    setState({ userId, workouts: result.workouts });
    return { workout: result.workout, before, after: summarize(result.workouts) };
  }, [userId, workouts]);

  const removeWorkout = useCallback((workoutId: string) => {
    if (userId == null) return;
    setState({ userId, workouts: deleteWorkout(userId, workoutId) });
  }, [userId]);

  return { workouts, summary, hasHealthConcerns, logWorkout, removeWorkout };
}
