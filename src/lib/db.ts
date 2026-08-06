import { Pool } from 'pg';
import { supabase } from './supabase';
import { DailyLog, ExerciseCategory, ExerciseRecord } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  max: 10,
  idleTimeoutMillis: 30000,
});

export const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000001';

// 1. 운동 종목 목록 가져오기 (Supabase REST -> PostgreSQL -> Memory)
export async function getCategories(userId: string = DEFAULT_USER_ID): Promise<ExerciseCategory[]> {
  try {
    const { data, error } = await supabase
      .from('exercise_categories')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as ExerciseCategory[];
    }
  } catch (err) {
    console.warn('Supabase categories fetch fallback to pg pool');
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, user_id, name, unit_type, category_tag, sort_order, is_active 
         FROM exercise_categories 
         WHERE user_id = $1 
         ORDER BY sort_order ASC`,
        [userId]
      );
      return res.rows;
    } finally {
      client.release();
    }
  } catch (pgErr) {
    return [
      { id: 'cat-1', user_id: DEFAULT_USER_ID, name: '턱걸이 (Pull-up)', unit_type: 'SET_REPS', category_tag: '상체', sort_order: 1, is_active: true },
      { id: 'cat-2', user_id: DEFAULT_USER_ID, name: '팔굽혀펴기 (Push-up)', unit_type: 'SET_REPS', category_tag: '상체', sort_order: 2, is_active: true },
      { id: 'cat-3', user_id: DEFAULT_USER_ID, name: 'AB 슬라이드', unit_type: 'SET_REPS', category_tag: '코어', sort_order: 3, is_active: true },
      { id: 'cat-4', user_id: DEFAULT_USER_ID, name: '달리기 (Running)', unit_type: 'DISTANCE_TIME', category_tag: '유산소', sort_order: 4, is_active: true },
      { id: 'cat-5', user_id: DEFAULT_USER_ID, name: '플랭크 (Plank)', unit_type: 'DURATION', category_tag: '코어', sort_order: 5, is_active: true }
    ];
  }
}

// 2. 운동 종목 생성
export async function createCategory(
  category: Omit<ExerciseCategory, 'id' | 'user_id' | 'sort_order' | 'is_active'>,
  userId: string = DEFAULT_USER_ID
): Promise<ExerciseCategory> {
  const currentCats = await getCategories(userId);
  const nextSort = currentCats.length + 1;

  try {
    const { data, error } = await supabase
      .from('exercise_categories')
      .insert({
        user_id: userId,
        name: category.name,
        unit_type: category.unit_type,
        category_tag: category.category_tag || '기타',
        sort_order: nextSort,
        is_active: true,
      })
      .select()
      .single();

    if (!error && data) {
      return data as ExerciseCategory;
    }
  } catch (err) {
    console.warn('Supabase createCategory error');
  }

  return {
    id: `cat-${Date.now()}`,
    user_id: userId,
    name: category.name,
    unit_type: category.unit_type,
    category_tag: category.category_tag || '기타',
    sort_order: nextSort,
    is_active: true,
  };
}

// 3. 운동 종목 수정/숨김/삭제
export async function updateCategory(id: string, updates: Partial<ExerciseCategory>): Promise<void> {
  try {
    await supabase.from('exercise_categories').update(updates).eq('id', id);
  } catch (err) {
    console.warn('Supabase updateCategory error');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await supabase.from('exercise_categories').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteCategory error');
  }
}

// 4. 특정 일자(Daily Log) 조회
export async function getDailyLogByDate(dateStr: string, userId: string = DEFAULT_USER_ID): Promise<DailyLog | null> {
  try {
    const { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', dateStr)
      .maybeSingle();

    if (logError || !logData) {
      return null;
    }

    const { data: recData } = await supabase
      .from('exercise_records')
      .select('*, exercise_categories(name, unit_type)')
      .eq('log_id', logData.id);

    const records: ExerciseRecord[] = (recData || []).map((r: any) => ({
      id: r.id,
      log_id: r.log_id,
      category_id: r.category_id,
      category_name: r.exercise_categories?.name || '운동',
      unit_type: r.exercise_categories?.unit_type || 'SET_REPS',
      sets_data: r.sets_data || [],
      total_reps: r.total_reps || 0,
      distance_km: Number(r.distance_km) || 0,
      duration_seconds: r.duration_seconds || 0,
    }));

    return {
      id: logData.id,
      user_id: logData.user_id,
      log_date: dateStr,
      weight: logData.weight ? Number(logData.weight) : null,
      memo: logData.memo || '',
      records,
    };
  } catch (err) {
    console.warn('Supabase getDailyLogByDate fallback');
    return null;
  }
}

// 5. 일일 기록 저장 (생성 또는 수정)
export async function saveDailyLog(logData: {
  date: string;
  weight: number | null;
  memo: string;
  records: Omit<ExerciseRecord, 'id' | 'log_id'>[];
}, userId: string = DEFAULT_USER_ID): Promise<DailyLog> {
  const cats = await getCategories(userId);

  try {
    // 1) Upsert daily_logs
    const { data: logRes, error: logErr } = await supabase
      .from('daily_logs')
      .upsert(
        {
          user_id: userId,
          log_date: logData.date,
          weight: logData.weight,
          memo: logData.memo || '',
        },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single();

    if (!logErr && logRes) {
      const logId = logRes.id;

      // 2) Delete existing records
      await supabase.from('exercise_records').delete().eq('log_id', logId);

      // 3) Insert new records
      if (logData.records.length > 0) {
        const recordsToInsert = logData.records.map((r) => ({
          log_id: logId,
          category_id: r.category_id,
          sets_data: r.sets_data || [],
          total_reps: r.total_reps || 0,
          distance_km: r.distance_km || 0,
          duration_seconds: r.duration_seconds || 0,
        }));

        await supabase.from('exercise_records').insert(recordsToInsert);
      }

      const updated = await getDailyLogByDate(logData.date, userId);
      if (updated) return updated;
    }
  } catch (err) {
    console.warn('Supabase saveDailyLog error, fallback');
  }

  // Memory return fallback
  const formattedRecords: ExerciseRecord[] = logData.records.map((r, idx) => {
    const matchedCat = cats.find((c) => c.id === r.category_id);
    return {
      id: `rec-${Date.now()}-${idx}`,
      log_id: `log-${logData.date}`,
      category_id: r.category_id,
      category_name: matchedCat ? matchedCat.name : r.category_name || '운동',
      unit_type: matchedCat ? matchedCat.unit_type : r.unit_type || 'SET_REPS',
      sets_data: r.sets_data || [],
      total_reps: r.total_reps || 0,
      distance_km: Number(r.distance_km) || 0,
      duration_seconds: r.duration_seconds || 0,
    };
  });

  return {
    id: `log-${logData.date}`,
    user_id: userId,
    log_date: logData.date,
    weight: logData.weight,
    memo: logData.memo || '',
    records: formattedRecords,
  };
}

// 6. 기간별 통계 데이터 조회 (주간 - 일요일 시작 포함)
export async function getStatsData(startDate: string, endDate: string, userId: string = DEFAULT_USER_ID) {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('log_date, weight, exercise_records(category_id, total_reps, distance_km, duration_seconds, exercise_categories(name, unit_type))')
      .eq('user_id', userId)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: true });

    if (!error && data) {
      const flattened: any[] = [];
      data.forEach((log: any) => {
        if (log.exercise_records && log.exercise_records.length > 0) {
          log.exercise_records.forEach((rec: any) => {
            flattened.push({
              log_date: log.log_date,
              weight: log.weight,
              category_id: rec.category_id,
              category_name: rec.exercise_categories?.name || '운동',
              unit_type: rec.exercise_categories?.unit_type || 'SET_REPS',
              total_reps: rec.total_reps || 0,
              distance_km: Number(rec.distance_km) || 0,
              duration_seconds: rec.duration_seconds || 0,
            });
          });
        } else {
          flattened.push({
            log_date: log.log_date,
            weight: log.weight,
            category_id: null,
            category_name: null,
            unit_type: null,
            total_reps: 0,
            distance_km: 0,
            duration_seconds: 0,
          });
        }
      });
      return flattened;
    }
  } catch (err) {
    console.warn('Supabase getStatsData error');
  }

  return [];
}
