import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bestRecentWorkout, loadWorkouts, removeWorkout as removeStoredWorkout, saveWorkout, type Workout } from '../services/workoutRepository';
import { fiveKEquivalent, summarizeLevel, type LevelSummary, type WorkoutEffort } from '../utils/leveling';

const summarize = (workouts: Workout[]): LevelSummary | null => {
  const best = bestRecentWorkout(workouts);
  return best ? summarizeLevel(fiveKEquivalent(best)) : null;
};

// The signed-in runner's workouts and current level. Used by the level page, party creation and buddy matching.
export function useMyLevel() {
  const { user } = useAuth();
  const userId = user?.id;
  const onboardingData = user?.onboardingData;
  const [state, setState] = useState<{ userId: typeof userId; workouts: Workout[]; loading: boolean }>({ userId: undefined, workouts: [], loading: true });

  // Reload when the signed-in account changes.
  useEffect(() => {
    let active = true;
    if (userId == null) { setState({ userId, workouts: [], loading: false }); return; }
    setState(current => ({ userId, workouts: current.userId === userId ? current.workouts : [], loading: true }));
    loadWorkouts(userId, onboardingData)
      .then(workouts => { if (active) setState({ userId, workouts, loading: false }); })
      .catch(error => { console.error('Could not load workouts', error); if (active) setState({ userId, workouts: [], loading: false }); });
    return () => { active = false; };
    // onboardingData only seeds the first workout; reloading on every edit would refetch for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const workouts = state.userId === userId ? state.workouts : [];
  const summary = useMemo(() => summarize(workouts), [workouts]);
  const hasHealthConcerns = Boolean(onboardingData?.safetyCheck?.concerns?.length);

  // Returns the level before and after, so callers can celebrate a level-up.
  const logWorkout = useCallback(async (input: WorkoutEffort & { date: string }) => {
    if (userId == null) throw new Error('Not authenticated');
    const before = summarize(workouts);
    const result = await saveWorkout(userId, input);
    setState({ userId, workouts: result.workouts, loading: false });
    return { workout: result.workout, before, after: summarize(result.workouts) };
  }, [userId, workouts]);

  const removeWorkout = useCallback(async (workoutId: string) => {
    if (userId == null) return;
    setState({ userId, workouts: await removeStoredWorkout(userId, workoutId), loading: false });
  }, [userId]);

  return { workouts, summary, hasHealthConcerns, loading: state.loading, logWorkout, removeWorkout };
}
