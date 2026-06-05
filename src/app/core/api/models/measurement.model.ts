export interface Measurement {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  muscle_mass_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  notes: string | null;
  created_at: string;
}
