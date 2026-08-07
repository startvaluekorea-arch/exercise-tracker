export type UnitType = 'SET_REPS' | 'TOTAL_REPS' | 'DISTANCE_TIME' | 'DURATION';

export interface SetData {
  set: number;
  reps: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  weight_unit?: string;
  is_public: boolean;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseCategory {
  id: string;
  user_id?: string;
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
  is_public: boolean; // 공개 여부 (TRUE: 공개, FALSE: 나만 보기)
  likes_count?: number;
  comments_count?: number;
  records: ExerciseRecord[];
  created_at?: string;
}

export interface CheerLike {
  id: string;
  log_id: string;
  user_id: string;
  reaction_type: '💪' | '🔥' | '👏' | '❤️';
  created_at: string;
}

export interface CheerComment {
  id: string;
  log_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface CommunityFeedLog extends DailyLog {
  user_profile?: UserProfile;
  distance_km?: number | null; // 내 위치 기준 떨어진 거리 (km)
  user_has_liked?: boolean;
  user_like_reaction?: string;
}

export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'half' | 'yearly';
