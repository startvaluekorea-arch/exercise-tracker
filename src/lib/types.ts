export type UnitType = 'SET_REPS' | 'TOTAL_REPS' | 'DISTANCE_TIME' | 'DURATION';

export interface SetData {
  set: number;
  reps: number;
}

export interface ExerciseCategory {
  id: string;
  user_id: string;
  name: string;
  unit_type: UnitType;
  category_tag: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ExerciseRecord {
  id?: string;
  log_id?: string;
  category_id: string;
  category_name?: string;
  unit_type?: UnitType;
  sets_data: SetData[];
  total_reps: number;
  distance_km: number;
  duration_seconds: number;
}

export interface DailyLog {
  id?: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  weight: number | null;
  memo: string;
  records: ExerciseRecord[];
  created_at?: string;
}

export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'half' | 'yearly';
