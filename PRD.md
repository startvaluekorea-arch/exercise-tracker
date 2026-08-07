# 🏋️‍♂️ 운동 & 몸무게 기록, 이웃 응원 피드 웹 서비스 PRD (Product Requirement Document)

> **버전**: v2.0 (Supabase Auth, RLS 데이터 격리, 거리 기반 이웃 피드 및 소셜 응원 반영)  
> **작성일**: 2026-08-07  

---

## 1. 🎯 프로젝트 개요 (Overview)

본 서비스는 사용자가 매일의 운동(턱걸이, 팔굽혀펴기, 달리어서 등)과 몸무게 변화를 간편하게 기록하고 통계로 관리하는 **모바일 퍼스트(Mobile-First) 헬스 트래킹 웹 앱**입니다.

**v2.0 핵심 확장**:
- **Supabase Auth** 기반의 안전한 로그인/회원가입 지원
- **Row Level Security (RLS)** 기반으로 로그인한 본인의 데이터만 기본적으로 안전하게 격리/보호
- **공개 / 비공개 (Public / Private)** 옵션을 제공하여 본인 일지를 선택적으로 커뮤니티에 공유
- **위치/거리 기반 (Distance-based)** 이웃 피드: 근처에 있는 다른 러너/운동 유저들과 거리(예: 1.2km 떨어진 이웃)를 표시
- **소셜 응원 기능**: 공개된 이웃의 일지에 **응원하기(좋아요/스탬프)**를 누르거나 **응원 댓글**을 남겨 상호 동기부여 제공

---

## 2. 🔑 주요 목표 & 시스템 비전 (Goals & Vision)

1. **🔐 보안 & 개인 데이터 격리 (Privacy & RLS)**:
   - Supabase Auth 인증을 적용하여 본인 계정 데이터만 조회/수정 가능.
   - 기본 설정은 **비공개(Private)**로 보호되며, 사용자가 원하는 기록만 **공개(Public)**로 전환.

2. **📍 거리 기반 이웃 피드 (Geo-Distance Neighbor Feed)**:
   - 사용자의 대략적인 위치 정보(위도/경도 또는 지역 단위)를 바탕으로 **떨어져 있는 거리(km/m)**를 계산 및 표시.
   - "500m 부근 헬스 메이트", "2.1km 떨어진 이웃 러너" 등의 직관적인 소셜 카드 연결.

3. **👏 소셜 응원 & 동기부여 (Cheering System)**:
   - 공개된 일지에 **응원하기 (좋아요/응원 스탬프 💪, 👏, 🔥)** 클릭.
   - **응원 댓글 (Cheer Comment)**을 통해 떨어진 거리의 운동 이웃끼리 긍정적인 메시지 교환.

4. **⚡ 첫 화면 즉시 기록 & 통계**:
   - 기존의 빠른 오늘 기록 동선 유지 및 주간(일요일 시작), 월간, 분기 통계 차트 제공.

---

## 3. 📱 핵심 기능 & UX 흐름 (Core Features & UX Flow)

### 3.1 사용자 인증 (Supabase Auth)
- **로그인/회원가입 폼**: 이메일/비밀번호 및 소셜 로그인 지원.
- **세션 상태 관리**: 비로그인 시 안내 스플래시 및 로그인 페이지로 유도, 로그인 시 개인 일지 메인으로 진입.

### 3.2 개인 데이터 격리 & 공개/비공개 설정
- **기본 비공개 (Default Private)**: 작성된 모든 일지와 운동 기록은 기본적으로 작성자 본인만 접근 가능.
- **공개 전환 스위치 (Public Toggle)**:
  - 프로필 설정: "내 프로필 이웃 피드에 공개하기" ON/OFF
  - 일지 작성/수정 시: `[🌐 피드에 공개]` / `[🔒 나만 보기]` 토글 스위치 제공.

### 3.3 거리 기반 이웃 피드 (Neighborhood Feed)
- **위치 정보 동의 및 등록**:
  - 브라우저 Geolocation API를 활용해 위치 등록 (또는 대표 동네 선택).
  - 프라이버시 보호를 위해 정확한 주소가 아닌 **대략적인 오프셋/거리(km/m)**만 표출.
- **이웃 탐색 탭 (Feed / Community Tab)**:
  - 공개 설정된 타 사용자들의 일지가 거리 순(가까운 이웃 순) 또는 최신 순으로 카드 표출.
  - 카드 표출 항목: 닉네임, 떨어진 거리 (`1.2 km 떨어진 이웃`), 오늘 수행한 운동 요약, 응원 수, 댓글 수.

### 3.4 응원하기 (좋아요) & 응원 댓글
- **응원하기 (Cheer Likes)**:
  - 이웃 일지 카드의 `[💪 응원하기]` 버튼 클릭 시 좋아요 카운트 증가.
  - 이모지 반응 선택 가능 (🔥 파이팅, 👏 대단해요, ❤️ 응원해요).
- **응원 댓글 (Cheer Comments)**:
  - 공개 일지 하단에 간단한 응원 댓글 작성 (예: "오늘도 턱걸이 최고네요! 같이 파이팅해요!").
  - 본인 일지에 달린 응원 댓글 및 좋아요 목록 확인 가능.

---

## 4. 🎨 모바일 퍼스트 내비게이션 구조

- **하단 고정 탭 바 (Bottom Navigation Bar)**:
  - 📌 `일지 (Record)`: 메인 오늘 기록/조회/수정 및 공개/비공개 토글
  - 📊 `통계 (Analytics)`: 개인 주기별(일요일 시작 주간, 월간 등) 성과 차트
  - 🌐 `이웃 피드 (Community)`: 거리 기반 이웃 운동 일지 탐색, 응원하기 및 댓글
  - ⚙️ `종목 관리 (Exercises)`: 운동 종목 커스텀 등록
  - 👤 `마이 (Profile)`: 계정 정보, 위치 설정, 공개 범위 기본값 설정 및 내 응원 알림

---

## 5. 🗄️ Supabase 데이터베이스 설계 & RLS (Database & RLS Schema)

```sql
-- 1. PostGIS 또는 거리 계산 유틸리티 함수 (Haversine 공식 거리 계산: km 단위)
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
  RETURN ROUND((R * c)::numeric, 1); -- 소수점 첫째자리 km 리턴
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. profiles (사용자 프로필 및 위치 정보)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  weight_unit TEXT DEFAULT 'kg',
  is_public BOOLEAN DEFAULT TRUE, -- 프로필 피드 노출 여부
  latitude NUMERIC(10, 7),        -- 위도
  longitude NUMERIC(10, 7),       -- 경도
  location_name TEXT,             -- 예: '서울시 마포구'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. exercise_categories (운동 종목 마스터)
CREATE TABLE exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL, -- 'SET_REPS', 'TOTAL_REPS', 'DISTANCE_TIME', 'DURATION'
  category_tag TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. daily_logs (일일 기록 메인 & 공개 여부)
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weight NUMERIC(5, 2),
  memo TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- 기본값 비공개 (나만 보기)
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_log_date UNIQUE (user_id, log_date)
);

-- 5. exercise_records (운동별 실적 기록)
CREATE TABLE exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  category_id UUID REFERENCES exercise_categories(id) ON DELETE CASCADE,
  sets_data JSONB,
  total_reps INT,
  distance_km NUMERIC(6, 2),
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. cheer_likes (응원/좋아요 테이블)
CREATE TABLE cheer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT '💪', -- '💪', '🔥', '👏', '❤️'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_log_like UNIQUE (log_id, user_id)
);

-- 7. cheer_comments (응원 댓글 테이블)
CREATE TABLE cheer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------------------------
-- Row Level Security (RLS) 정책 설정
----------------------------------------------------------------

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheer_comments ENABLE ROW LEVEL SECURITY;

-- Profiles Policy: 본인 관리 및 공개 프로필 전체 조회
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_public = TRUE OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Daily Logs Policy: 본인 작성 일지 관리 및 공개 일지 전체 조회
CREATE POLICY "Users can view own logs or public logs" ON daily_logs
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own logs" ON daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON daily_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Cheer Likes Policy: 공개 일지에 대해 누구나 조회/작성
CREATE POLICY "Anyone can view likes on accessible logs" ON cheer_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_logs 
      WHERE daily_logs.id = cheer_likes.log_id 
      AND (daily_logs.is_public = TRUE OR daily_logs.user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can like public logs" ON cheer_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON cheer_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Cheer Comments Policy: 공개 일지에 대해 누구나 조회/작성
CREATE POLICY "Anyone can view comments on accessible logs" ON cheer_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_logs 
      WHERE daily_logs.id = cheer_comments.log_id 
      AND (daily_logs.is_public = TRUE OR daily_logs.user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can comment on public logs" ON cheer_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON cheer_comments
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 6. 🚀 마일스톤 (Milestones)

1. **Phase 1: Auth & RLS 통합**
   - Supabase Auth 회원가입/로그인 UI 및 세션 컨텍스트 연동
   - 데이터베이스 RLS 적용으로 개인 데이터 완벽 보안 격리

2. **Phase 2: 공개/비공개 토글 & 이웃 탐색 피드**
   - 일지별/프로필별 공개 여부 선택 옵션 개발
   - 브라우저 위치 정보 기반 거리를 계산하는 SQL 함수 및 거리순 이웃 피드 UI 개발

3. **Phase 3: 소셜 응원(좋아요 & 댓글) 시스템**
   - 이웃 피드에서 응원 스탬프(좋아요) 누르기 및 카운트 실시간 업데이트
   - 응원 댓글 작성, 조회 및 내 일지에 들어온 소셜 반응 알림 표시
