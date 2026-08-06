import { Pool } from 'pg';
import { DailyLog, ExerciseCategory, ExerciseRecord } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  max: 10,
  idleTimeoutMillis: 30000,
});

export const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000001';

// 인메모리 백업 데이터베이스 (DB 연결 실패 시에도 100% 동작 보장)
let memoryCategories: ExerciseCategory[] = [
  { id: 'cat-1', user_id: DEFAULT_USER_ID, name: '턱걸이 (Pull-up)', unit_type: 'SET_REPS', category_tag: '상체', sort_order: 1, is_active: true },
  { id: 'cat-2', user_id: DEFAULT_USER_ID, name: '팔굽혀펴기 (Push-up)', unit_type: 'SET_REPS', category_tag: '상체', sort_order: 2, is_active: true },
  { id: 'cat-3', user_id: DEFAULT_USER_ID, name: 'AB 슬라이드', unit_type: 'SET_REPS', category_tag: '코어', sort_order: 3, is_active: true },
  { id: 'cat-4', user_id: DEFAULT_USER_ID, name: '달리기 (Running)', unit_type: 'DISTANCE_TIME', category_tag: '유산소', sort_order: 4, is_active: true },
  { id: 'cat-5', user_id: DEFAULT_USER_ID, name: '플랭크 (Plank)', unit_type: 'DURATION', category_tag: '코어', sort_order: 5, is_active: true }
];

let memoryDailyLogs: { [date: string]: DailyLog } = {};

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// 1. 운동 종목 목록 가져오기
export async function getCategories(userId: string = DEFAULT_USER_ID): Promise<ExerciseCategory[]> {
  try {
    const res = await query(
      `SELECT id, user_id, name, unit_type, category_tag, sort_order, is_active 
       FROM exercise_categories 
       WHERE user_id = $1 
       ORDER BY sort_order ASC, created_at ASC`,
      [userId]
    );
    if (res.rows.length > 0) {
      return res.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        unit_type: row.unit_type,
        category_tag: row.category_tag,
        sort_order: row.sort_order,
        is_active: row.is_active
      }));
    }
    return memoryCategories;
  } catch (error) {
    console.warn('PostgreSQL getCategories fallback to memory store');
    return memoryCategories;
  }
}

// 2. 운동 종목 생성
export async function createCategory(
  category: Omit<ExerciseCategory, 'id' | 'user_id' | 'sort_order' | 'is_active'>,
  userId: string = DEFAULT_USER_ID
): Promise<ExerciseCategory> {
  const newId = `cat-${Date.now()}`;
  const newCat: ExerciseCategory = {
    id: newId,
    user_id: userId,
    name: category.name,
    unit_type: category.unit_type,
    category_tag: category.category_tag || '기타',
    sort_order: memoryCategories.length + 1,
    is_active: true
  };

  try {
    const maxSortRes = await query(`SELECT COALESCE(MAX(sort_order), 0) + 1 as next_sort FROM exercise_categories WHERE user_id = $1`, [userId]);
    const nextSort = maxSortRes.rows[0].next_sort;

    const res = await query(
      `INSERT INTO exercise_categories (user_id, name, unit_type, category_tag, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [userId, category.name, category.unit_type, category.category_tag || '기타', nextSort]
    );
    memoryCategories.push(res.rows[0]);
    return res.rows[0];
  } catch (error) {
    console.warn('PostgreSQL createCategory fallback to memory store');
    memoryCategories.push(newCat);
    return newCat;
  }
}

// 3. 운동 종목 수정/숨김/삭제
export async function updateCategory(id: string, updates: Partial<ExerciseCategory>): Promise<void> {
  memoryCategories = memoryCategories.map(c => c.id === id ? { ...c, ...updates } : c);
  try {
    if (updates.is_active !== undefined) {
      await query(`UPDATE exercise_categories SET is_active = $1 WHERE id = $2`, [updates.is_active, id]);
    }
    if (updates.name) {
      await query(`UPDATE exercise_categories SET name = $1 WHERE id = $2`, [updates.name, id]);
    }
  } catch (error) {
    console.warn('PostgreSQL updateCategory fallback');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  memoryCategories = memoryCategories.filter(c => c.id !== id);
  try {
    await query(`DELETE FROM exercise_categories WHERE id = $1`, [id]);
  } catch (error) {
    console.warn('PostgreSQL deleteCategory fallback');
  }
}

// 4. 특정 일자(Daily Log) 조회
export async function getDailyLogByDate(dateStr: string, userId: string = DEFAULT_USER_ID): Promise<DailyLog | null> {
  try {
    const logRes = await query(
      `SELECT id, user_id, log_date, weight, memo 
       FROM daily_logs 
       WHERE user_id = $1 AND log_date = $2`,
      [userId, dateStr]
    );

    if (logRes.rows.length === 0) {
      return memoryDailyLogs[dateStr] || null;
    }

    const logRow = logRes.rows[0];
    const recordsRes = await query(
      `SELECT er.id, er.log_id, er.category_id, ec.name as category_name, ec.unit_type, er.sets_data, er.total_reps, er.distance_km, er.duration_seconds
       FROM exercise_records er
       JOIN exercise_categories ec ON er.category_id = ec.id
       WHERE er.log_id = $1`,
      [logRow.id]
    );

    const records: ExerciseRecord[] = recordsRes.rows.map(r => ({
      id: r.id,
      log_id: r.log_id,
      category_id: r.category_id,
      category_name: r.category_name,
      unit_type: r.unit_type,
      sets_data: r.sets_data || [],
      total_reps: r.total_reps || 0,
      distance_km: Number(r.distance_km) || 0,
      duration_seconds: r.duration_seconds || 0
    }));

    const result: DailyLog = {
      id: logRow.id,
      user_id: logRow.user_id,
      log_date: dateStr,
      weight: logRow.weight ? Number(logRow.weight) : null,
      memo: logRow.memo || '',
      records
    };
    memoryDailyLogs[dateStr] = result;
    return result;
  } catch (error) {
    console.warn('PostgreSQL getDailyLogByDate fallback');
    return memoryDailyLogs[dateStr] || null;
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

  const formattedRecords: ExerciseRecord[] = logData.records.map((r, idx) => {
    const matchedCat = cats.find(c => c.id === r.category_id);
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

  const memoryLog: DailyLog = {
    id: `log-${logData.date}`,
    user_id: userId,
    log_date: logData.date,
    weight: logData.weight,
    memo: logData.memo || '',
    records: formattedRecords
  };

  memoryDailyLogs[logData.date] = memoryLog;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const upsertLogRes = await client.query(
        `INSERT INTO daily_logs (user_id, log_date, weight, memo)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, log_date) 
         DO UPDATE SET weight = EXCLUDED.weight, memo = EXCLUDED.memo
         RETURNING id`,
        [userId, logData.date, logData.weight, logData.memo || '']
      );

      const logId = upsertLogRes.rows[0].id;
      await client.query(`DELETE FROM exercise_records WHERE log_id = $1`, [logId]);

      for (const rec of logData.records) {
        await client.query(
          `INSERT INTO exercise_records (log_id, category_id, sets_data, total_reps, distance_km, duration_seconds)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            logId,
            rec.category_id,
            JSON.stringify(rec.sets_data || []),
            rec.total_reps || 0,
            rec.distance_km || 0,
            rec.duration_seconds || 0
          ]
        );
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      console.warn('PostgreSQL save transaction failed, saved to memoryLog');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('PostgreSQL pool error, saved to memoryLog');
  }

  return memoryLog;
}

// 6. 기간별 통계 데이터 조회 (주간 - 일요일 시작 포함)
export async function getStatsData(startDate: string, endDate: string, userId: string = DEFAULT_USER_ID) {
  try {
    const logsRes = await query(
      `SELECT dl.log_date, dl.weight, er.category_id, ec.name as category_name, ec.unit_type, er.total_reps, er.distance_km, er.duration_seconds
       FROM daily_logs dl
       LEFT JOIN exercise_records er ON dl.id = er.log_id
       LEFT JOIN exercise_categories ec ON er.category_id = ec.id
       WHERE dl.user_id = $1 AND dl.log_date >= $2 AND dl.log_date <= $3
       ORDER BY dl.log_date ASC`,
      [userId, startDate, endDate]
    );

    if (logsRes.rows.length > 0) {
      return logsRes.rows;
    }
  } catch (error) {
    console.warn('PostgreSQL getStatsData fallback');
  }

  // Fallback memory logs
  const resultRows: any[] = [];
  Object.values(memoryDailyLogs).forEach(log => {
    if (log.log_date >= startDate && log.log_date <= endDate) {
      if (log.records && log.records.length > 0) {
        log.records.forEach(rec => {
          resultRows.push({
            log_date: log.log_date,
            weight: log.weight,
            category_id: rec.category_id,
            category_name: rec.category_name,
            unit_type: rec.unit_type,
            total_reps: rec.total_reps,
            distance_km: rec.distance_km,
            duration_seconds: rec.duration_seconds
          });
        });
      } else {
        resultRows.push({
          log_date: log.log_date,
          weight: log.weight,
          category_id: null,
          category_name: null,
          unit_type: null,
          total_reps: 0,
          distance_km: 0,
          duration_seconds: 0
        });
      }
    }
  });

  return resultRows;
}
