import { Exercise } from './exercise.model';

export interface RoutineExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number | null;
  target_reps: number | null;
  target_weight: number | null;
  rest_seconds: number | null;
  exercise?: Exercise;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  routine_exercises?: RoutineExercise[];
}
