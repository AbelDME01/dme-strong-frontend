export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  height_cm: number | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}
