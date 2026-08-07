-- 1. 두 좌표간 직선 거리(km) 계산 PostgreSQL SQL 함수
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 NUMERIC, lon1 NUMERIC,
  lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  R NUMERIC := 6371; -- 지구 반지름 (km)
  dLat NUMERIC := radians(lat2 - lat1);
  dLon NUMERIC := radians(lon2 - lon1);
  a NUMERIC;
  c NUMERIC;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  a := sin(dLat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN ROUND((R * c)::numeric, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. profiles (사용자 프로필)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  bio TEXT,
  weight_unit TEXT NOT NULL DEFAULT 'kg',
  is_public BOOLEAN DEFAULT TRUE,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  location_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO profiles (id, username, bio, is_public)
VALUES ('00000000-0000-0000-0000-000000000001', '데모 유저', '매일 꾸준한 운동!', true)
ON CONFLICT (id) DO NOTHING;

-- 3. exercise_categories (운동 종목 마스터)
CREATE TABLE IF NOT EXISTS exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  category_tag TEXT DEFAULT '기타',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. daily_logs (일일 기록 메인 & 공개 여부)
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weight NUMERIC(5, 2),
  memo TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_log_date UNIQUE (user_id, log_date)
);

-- 5. exercise_records (운동별 실적 기록)
CREATE TABLE IF NOT EXISTS exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  category_id UUID REFERENCES exercise_categories(id) ON DELETE CASCADE,
  sets_data JSONB,
  total_reps INT DEFAULT 0,
  distance_km NUMERIC(6, 2) DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. cheer_likes (응원/좋아요 테이블)
CREATE TABLE IF NOT EXISTS cheer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT '💪',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_log_like UNIQUE (log_id, user_id)
);

-- 7. cheer_comments (응원 댓글 테이블)
CREATE TABLE IF NOT EXISTS cheer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO exercise_categories (user_id, name, unit_type, category_tag, sort_order)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '턱걸이 (Pull-up)', 'SET_REPS', '상체', 1),
  ('00000000-0000-0000-0000-000000000001', '팔굽혀펴기 (Push-up)', 'SET_REPS', '상체', 2),
  ('00000000-0000-0000-0000-000000000001', 'AB 슬라이드', 'SET_REPS', '코어', 3),
  ('00000000-0000-0000-0000-000000000001', '달리기 (Running)', 'DISTANCE_TIME', '유산소', 4),
  ('00000000-0000-0000-0000-000000000001', '플랭크 (Plank)', 'DURATION', '코어', 5)
ON CONFLICT DO NOTHING;

----------------------------------------------------------------
-- Supabase Row Level Security (RLS) Policies
----------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheer_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: 공개 프로필 누구나 읽기, 본인 프로필만 수정
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_public = TRUE OR auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Daily Logs: 본인 일지 관리 및 공개 일지 전체 조회
DROP POLICY IF EXISTS "Users can view own logs or public logs" ON daily_logs;
CREATE POLICY "Users can view own logs or public logs" ON daily_logs
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

DROP POLICY IF EXISTS "Users can insert own logs" ON daily_logs;
CREATE POLICY "Users can insert own logs" ON daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own logs" ON daily_logs;
CREATE POLICY "Users can update own logs" ON daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own logs" ON daily_logs;
CREATE POLICY "Users can delete own logs" ON daily_logs
  FOR DELETE USING (auth.uid() = user_id);
