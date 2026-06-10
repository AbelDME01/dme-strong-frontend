import {
  workoutVolume,
  exerciseProgression,
  recentSetsForExercise,
  totalSets,
  streakDays,
  computeWeekDone,
  weekVolume,
} from './stats.util';
import { Workout, WorkoutSet } from './models';

function set(partial: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: 'sid',
    workout_id: 'w',
    exercise_id: 'ex1',
    set_number: 1,
    reps: null,
    weight_kg: null,
    duration_seconds: null,
    distance_meters: null,
    rpe: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    ...partial,
  };
}

function workout(partial: Partial<Workout>): Workout {
  return {
    id: 'w',
    user_id: 'u',
    routine_id: null,
    name: 'W',
    notes: null,
    started_at: '2024-01-01T00:00:00Z',
    finished_at: null,
    duration_seconds: null,
    created_at: '2024-01-01T00:00:00Z',
    workout_sets: [],
    ...partial,
  };
}

describe('stats.util', () => {
  describe('workoutVolume', () => {
    it('sums weight * reps, treating nulls as zero', () => {
      const sets = [
        set({ weight_kg: 100, reps: 5 }), // 500
        set({ weight_kg: 80, reps: 10 }), // 800
        set({ weight_kg: null, reps: 10 }), // 0
        set({ weight_kg: 60, reps: null }), // 0
      ];
      expect(workoutVolume(sets)).toBe(1300);
    });

    it('returns 0 for empty/undefined input', () => {
      expect(workoutVolume([])).toBe(0);
      expect(workoutVolume(undefined)).toBe(0);
    });
  });

  describe('exerciseProgression', () => {
    it('takes the heaviest set per workout for the exercise, oldest first', () => {
      const workouts = [
        workout({
          started_at: '2024-03-01T00:00:00Z',
          workout_sets: [set({ weight_kg: 90, reps: 3 }), set({ weight_kg: 95, reps: 1 })],
        }),
        workout({
          started_at: '2024-01-01T00:00:00Z',
          workout_sets: [set({ weight_kg: 80, reps: 5 })],
        }),
      ];
      expect(exerciseProgression(workouts, 'ex1')).toEqual([
        { date: '2024-01-01T00:00:00Z', weightKg: 80 },
        { date: '2024-03-01T00:00:00Z', weightKg: 95 },
      ]);
    });

    it('skips workouts with no weighted set for the exercise', () => {
      const workouts = [
        workout({ workout_sets: [set({ exercise_id: 'other', weight_kg: 50, reps: 5 })] }),
        workout({ workout_sets: [set({ weight_kg: null, reps: 5 })] }),
      ];
      expect(exerciseProgression(workouts, 'ex1')).toEqual([]);
    });
  });

  describe('recentSetsForExercise', () => {
    it('returns the exercise sets most recent first, limited', () => {
      const workouts = [
        workout({ started_at: '2024-01-01T00:00:00Z', workout_sets: [set({ weight_kg: 80, reps: 5 })] }),
        workout({ started_at: '2024-02-01T00:00:00Z', workout_sets: [set({ weight_kg: 85, reps: 4 })] }),
      ];
      const rows = recentSetsForExercise(workouts, 'ex1', 1);
      expect(rows.length).toBe(1);
      expect(rows[0].weightKg).toBe(85);
      expect(rows[0].date).toBe('2024-02-01T00:00:00Z');
    });
  });

  describe('totalSets', () => {
    it('counts all sets across workouts', () => {
      const workouts = [
        workout({ workout_sets: [set({}), set({})] }),
        workout({ workout_sets: [set({})] }),
      ];
      expect(totalSets(workouts)).toBe(3);
    });
  });

  describe('streakDays', () => {
    it('returns 0 when no workouts', () => {
      expect(streakDays([])).toBe(0);
    });

    it('counts consecutive days ending today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      const workouts = [
        workout({ started_at: today.toISOString() }),
        workout({ started_at: yesterday.toISOString() }),
        workout({ started_at: twoDaysAgo.toISOString() }),
      ];
      expect(streakDays(workouts)).toBe(3);
    });

    it('stops at a gap', () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      const workouts = [
        workout({ started_at: today.toISOString() }),
        workout({ started_at: twoDaysAgo.toISOString() }),
      ];
      // Gap yesterday → streak is 1 (only today)
      expect(streakDays(workouts)).toBe(1);
    });
  });

  describe('computeWeekDone', () => {
    it('marks days with workouts in current week, Mon=0', () => {
      const monday = new Date();
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      const result = computeWeekDone([workout({ started_at: monday.toISOString() })]);
      expect(result[0]).toBe(true);
      expect(result.slice(1).every((v) => !v)).toBe(true);
    });

    it('ignores workouts outside the current week', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 8);
      expect(computeWeekDone([workout({ started_at: lastWeek.toISOString() })])).toEqual(
        [false, false, false, false, false, false, false],
      );
    });
  });

  describe('weekVolume', () => {
    it('sums volume only for workouts in current week', () => {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 8);
      const workouts = [
        workout({ started_at: today.toISOString(), workout_sets: [set({ weight_kg: 100, reps: 5 })] }),
        workout({ started_at: lastWeek.toISOString(), workout_sets: [set({ weight_kg: 100, reps: 5 })] }),
      ];
      expect(weekVolume(workouts)).toBe(500);
    });
  });
});
