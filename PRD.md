# 🏋️‍♂️ 운동 & 몸무게 기록 및 통계 웹 서비스 PRD (Product Requirement Document)

> **버전**: v1.3 (첫 화면 즉시 입력/조회 UX 흐름 반영)  
> **작성일**: 2026-08-06  

---

## 1. 프로젝트 개요 (Overview)
본 프로젝트는 사용자가 일상적인 운동(턱걸이, 팔굽혀펴기, AB슬라이드, 달리기 등)과 몸무게 변화를 일일 단위로 간편하게 기록하고, 이를 다양한 기간 단위(**주간-일요일 시작**, **월간**, **분기**, **반기**, **연간**)로 시각화하여 분석할 수 있는 **모바일 퍼스트(Mobile-First)** 웹 대시보드 애플리케이션 개발을 목표로 합니다.

앱 진입 시 **첫 화면에서 오늘(Today) 날짜의 기록 폼이 즉시 노출**되어, 기존 기록이 있으면 바로 조회 및 빠른 수정을, 기록이 없으면 즉시 입력을 수행할 수 있는 직관적인 동선을 제공합니다.

---

## 2. 주요 목표 & 시스템 비전 (Goals & Vision)

- **⚡ 첫 화면 즉시 기록 (Instant Today Logger)**: 앱 접속 시 오늘 날짜로 자동 설정. 기록이 있으면 요약/수정 화면, 없으면 즉시 입력 폼 노출.
- **📱 모바일 최적화 UX/UI**: 한 손 조작이 용이한 하단 탭 바(Bottom Nav), 좌우 날짜 이동 스와이프, 터치 피드백.
- **🎨 눈이 편안한 고가시성 디자인**: 눈의 피로를 최소화하는 딥 슬레이트 테마 기반 Muted Emerald & Soft Cyan/Amber 조화로운 포인트 컬러 시스템.
- **자유로운 운동 종목 커스텀**: 운동 종목(세트/횟수형, 시간형, 유산소 거리형 등)의 추가, 수정, 숨김/삭제 지원.
- **일요일 시작 주간 통계 및 다양한 분석 주기**:
  - **주간 (Weekly)**: **일요일 ~ 토요일 (Sun ~ Sat)** 기준 주간 뷰 지원
  - **월간 / 분기 / 반기 / 연간** 통계 차트 및 성장 리포트 제공
- **단계별 배포 및 테스팅 파이프라인**:
  - 1단계: **Docker & Docker Compose** 기반 로컬 독립 테스트 환경
  - 2단계: **GitHub Repository** + **Supabase (DB & Auth)** + **Vercel (자동 빌드/배포)** 프로덕션 연동

---

## 3. 📱 첫 화면 UX & 메인 일지 동선 (Core Today Screen Flow)

```
[ 앱 접속 (첫 화면) ]
         │
         ▼
[ 오늘(Today) 날짜 자동 세팅 ]
         │
 ┌───────┴─────────────────────────────┐
 │                                     │
 ▼ (기록 없음)                         ▼ (기록 존재)
[ 오늘 기록 작성 폼 ]               [ 입력된 당일 실적 요약 카드 ]
- 몸무게 입력                          - 오늘 몸무게 (전일 대비 증감 표시)
- 활성화된 운동 목록 세트/횟수 작성      - 수행한 운동별 세트/거리 요약
- [저장하기] 버튼                      - ✏️ [빠른 수정] 버튼 클릭 시 즉시 편집
```

### 3.1 날짜 전환 헤더 (Date Picker Header)
- 화면 최상단: `◀ 2026년 8월 6일 (오늘) ▶` (좌/우 화살표 터치 또는 스와이프로 어제/내일 이동 가능).
- `[오늘]` 버튼: 다른 날짜 조회 중 한 번의 터치로 오늘 날짜로 원복.

### 3.2 오늘 데이터가 없는 경우 (New Entry Mode)
- **몸무게 입력 카운터/키패드**: 소수점 빠른 입력.
- **활성화된 운동 종목 리스트**:
  - 종목별 세트 추가 `(+)` 버튼으로 빠른 세트 입력 (예: 1세트 10회 ➜ 2세트 10회).
- 하단 **`[오늘 기록 저장]`** 고정 액션 버튼.

### 3.3 오늘 데이터가 이미 있는 경우 (View & Quick Edit Mode)
- **오늘의 요약 뷰 카드**:
  - ⚖️ 몸무게: `72.5 kg` (어제 대비 -0.3kg 🔻)
  - 🏋️‍♂️ 오늘 수행한 운동 리포트 (예: 턱걸이 총 45회 / 4세트, 달리기 3.5km).
  - 📝 당일 메모
- **`[수정하기]` / `[세트 추가]`**: 원터치로 수정 모드 전환하여 즉시 값 업데이트 가능.

---

## 4. 🎨 모바일 퍼스트 디자인 시스템 (Mobile UI/UX System)

### 4.1 모바일 레이아웃 & 내비게이션
- **하단 고정 탭 바 (Bottom Navigation Bar)**:
  - 📌 `일지 (Record)`: 첫 화면 (오늘 기록/조회/수정)
  - 📊 `통계 (Analytics)`: 주(일요일 시작)/월/분기/반기/연간 차트 뷰
  - ⚙️ `종목 관리 (Exercises)`: 운동 종목 추가/수정/순서 변경
  - 👤 `마이 (Profile)`: 데이터 백업 및 설정

### 4.2 피로감 최소화 & 고가시성 컬러 팔레트 (Comfort & High Contrast)
- **배경 (Background)**: `#0F172A` (Deep Slate - 눈이 편안한 딥 슬레이트)
- **주요 색상 (Primary Accent)**: `#10B981` / `#34D399` (Muted Sage Emerald - 편안한 그린 톤)
- **보조 색상 (Secondary)**: `#38BDF8` (Soft Cyan) / `#F59E0B` (Warm Amber)
- **텍스트 (Text)**: `#F8FAFC` (Warm White) / `#94A3B8` (Soft Gray)

---

## 5. 상세 기능 요구사항 (Detailed Specifications)

### 5.1 운동 종목 커스텀 관리
- 종목 관리 스와이프 액션 (순서 변경, 삭제/숨김)
- 유형: `세트+횟수`, `총 횟수`, `거리+시간`, `시간`

### 5.2 주기별 통계 대시보드 (Multi-period Analytics)
- **주간 (Weekly)**: **일요일부터 토요일까지 (Sunday ~ Saturday)**
- **월간 / 분기 / 반기 / 연간** 슬라이더 세그먼트
- Recharts 모바일 반응형 터치 차트

---

## 6. Supabase 데이터베이스 설계 (Database Schema)

```sql
-- profiles (사용자 프로필)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  weight_unit TEXT DEFAULT 'kg',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- exercise_categories (운동 종목 마스터)
CREATE TABLE exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL, -- 'SET_REPS', 'TOTAL_REPS', 'DISTANCE_TIME', 'DURATION'
  category_tag TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_logs (일일 기록 메인)
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  log_date DATE NOT NULL,
  weight NUMERIC(5, 2),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_log_date UNIQUE (user_id, log_date)
);

-- exercise_records (운동별 실적 기록)
CREATE TABLE exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  category_id UUID REFERENCES exercise_categories(id),
  sets_data JSONB, -- [{"set": 1, "reps": 10}, {"set": 2, "reps": 8}]
  total_reps INT,
  distance_km NUMERIC(6, 2),
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. 마일스톤 및 개발 단계 (Milestones)

### Phase 1: 로컬 모바일 웹 개발 & Docker 테스트 환경 구축
1. Next.js 기반 첫 화면 (오늘 날짜 자동 로드, 입력/조회/수정 모드 전환 UX) 개발
2. 모바일 반응형 딥 슬레이트 & 에메랄드 테마 구축 및 Dockerfile/docker-compose 작성
3. 종목 관리 CRUD, 주간(일요일 시작) 및 각 주기별 통계 차트 구현

### Phase 2: Supabase & GitHub & Vercel 연동 배포
1. Supabase PostgreSQL 마이그레이션 & RLS 설정
2. Supabase Auth 연동
3. GitHub 레포지토리 연결 및 Vercel 자동 배포
