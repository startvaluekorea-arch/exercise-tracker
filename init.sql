CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL DEFAULT 'User',
  weight_unit TEXT NOT NULL DEFAULT 'kg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO profiles (id, username)
VALUES ('00000000-0000-0000-0000-000000000001', 'User')
ON CONFLICT (id) DO NOTHING;

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

CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weight NUMERIC(5, 2),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_log_date UNIQUE (user_id, log_date)
);

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

INSERT INTO exercise_categories (user_id, name, unit_type, category_tag, sort_order)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '턱걸이 (Pull-up)', 'SET_REPS', '상체', 1),
  ('00000000-0000-0000-0000-000000000001', '팔굽혀펴기 (Push-up)', 'SET_REPS', '상체', 2),
  ('00000000-0000-0000-0000-000000000001', 'AB 슬라이드', 'SET_REPS', '코어', 3),
  ('00000000-0000-0000-0000-000000000001', '달리기 (Running)', 'DISTANCE_TIME', '유산소', 4),
  ('00000000-0000-0000-0000-000000000001', '플랭크 (Plank)', 'DURATION', '코어', 5)
ON CONFLICT DO NOTHING;
