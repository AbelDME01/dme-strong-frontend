export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  equipment: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}
