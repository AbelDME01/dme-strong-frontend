import { Workout, WorkoutSet } from './models';

/** A single data point of an exercise's weight progression over time. */
export interface ProgressionPoint {
  /** ISO timestamp of the workout the point belongs to. */
  date: string;
  /** Heaviest weight (kg) lifted for the exercise in that workout. */
  weightKg: number;
}

/** A flattened set for an exercise, enriched with the parent workout date. */
export interface ExerciseSet {
  date: string;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
}

/** Total volume (kg) of a list of sets: sum of weight * reps. Null fields count as 0. */
export function workoutVolume(sets: readonly WorkoutSet[] | undefined): number {
  if (!sets?.length) return 0;
  return sets.reduce((total, s) => total + (s.weight_kg ?? 0) * (s.reps ?? 0), 0);
}

/** Number of sets recorded for a given exercise across a list of workouts. */
function setsForExercise(workouts: readonly Workout[], exerciseId: string): WorkoutSet[] {
  return workouts.flatMap((w) =>
    (w.workout_sets ?? []).filter((s) => s.exercise_id === exerciseId),
  );
}

/**
 * Builds the chronological weight progression for one exercise: one point per
 * workout (oldest first), using the heaviest set of that workout. Workouts with
 * no weighted set for the exercise are skipped.
 */
export function exerciseProgression(
  workouts: readonly Workout[],
  exerciseId: string,
): ProgressionPoint[] {
  return [...workouts]
    .map((w) => {
      const weights = (w.workout_sets ?? [])
        .filter((s) => s.exercise_id === exerciseId && s.weight_kg != null)
        .map((s) => s.weight_kg as number);
      if (!weights.length) return null;
      return { date: w.started_at, weightKg: Math.max(...weights) };
    })
    .filter((p): p is ProgressionPoint => p !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Returns the sets for an exercise across workouts, most recent first, enriched
 * with the workout date. Useful for the "recent sets" list.
 */
export function recentSetsForExercise(
  workouts: readonly Workout[],
  exerciseId: string,
  limit = 10,
): ExerciseSet[] {
  return workouts
    .flatMap((w) =>
      (w.workout_sets ?? [])
        .filter((s) => s.exercise_id === exerciseId)
        .map((s) => ({
          date: w.started_at,
          weightKg: s.weight_kg,
          reps: s.reps,
          rpe: s.rpe,
        })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/** Total number of sets across a list of workouts (helper for dashboards). */
export function totalSets(workouts: readonly Workout[]): number {
  return workouts.reduce((n, w) => n + (w.workout_sets?.length ?? 0), 0);
}

/**
 * Returns the total volume (kg) of all workouts that started in the current
 * Monday-to-Sunday calendar week.
 */
export function weekVolume(workouts: readonly Workout[]): number {
  const monday = startOfCurrentWeek();
  return workouts
    .filter((w) => new Date(w.started_at) >= monday)
    .reduce((sum, w) => sum + workoutVolume(w.workout_sets), 0);
}

/**
 * Returns a 7-element boolean array (Mon=0..Sun=6) where true means the user
 * logged at least one workout on that day in the current calendar week.
 */
export function computeWeekDone(workouts: readonly Workout[]): boolean[] {
  const done = [false, false, false, false, false, false, false];
  const monday = startOfCurrentWeek();
  for (const w of workouts) {
    const d = new Date(w.started_at);
    if (d >= monday) done[(d.getDay() + 6) % 7] = true;
  }
  return done;
}

/**
 * Returns the number of consecutive days (ending today) on which at least one
 * workout was logged.
 */
export function streakDays(workouts: readonly Workout[]): number {
  if (!workouts.length) return 0;
  const days = new Set(
    workouts.map((w) => new Date(w.started_at).toLocaleDateString('sv-SE')),
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.has(cursor.toLocaleDateString('sv-SE'))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function startOfCurrentWeek(): Date {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/** Re-exported so callers don't import the model just for the helper signature. */
export { setsForExercise };
