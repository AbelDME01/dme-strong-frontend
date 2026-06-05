export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  notes: string | null;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  workout_sets?: WorkoutSet[];
}
