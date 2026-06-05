import { Exercise } from './exercise.model';

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  record_type: string;
  value: number;
  unit: string;
  achieved_at: string;
  workout_id: string | null;
  created_at: string;
  exercise?: Exercise;
  exercises?: Pick<Exercise, 'name' | 'muscle_group'>;
}
