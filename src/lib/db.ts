import { supabase } from './supabase';
import { DailyLog, ExerciseCategory, ExerciseRecord, CommunityFeedLog, CheerComment, UserProfile } from './types';
import { calculateDistance } from './geoUtils';

export const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000001';

// 1. 운동 종목 목록 가져오기
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
    console.warn('Supabase categories fetch fallback');
  }

  return [
    { id: 'cat-1', user_id: DEFAULT_USER_ID, name: '턱걸이 (Pull-up)', unit_type: 'SET_REPS', category_tag: '상체', sort_order: 1, is_active: true },
    { id: 'cat-2', user_id: DEFAULT_USER_ID, name: '팔굽혀펴기 (Push-up)', unit_type: 'SET_REPS', category_tag: '상체', sort_order: 2, is_active: true },
    { id: 'cat-3', user_id: DEFAULT_USER_ID, name: 'AB 슬라이드', unit_type: 'SET_REPS', category_tag: '코어', sort_order: 3, is_active: true },
    { id: 'cat-4', user_id: DEFAULT_USER_ID, name: '달리기 (Running)', unit_type: 'DISTANCE_TIME', category_tag: '유산소', sort_order: 4, is_active: true },
    { id: 'cat-5', user_id: DEFAULT_USER_ID, name: '플랭크 (Plank)', unit_type: 'DURATION', category_tag: '코어', sort_order: 5, is_active: true }
  ];
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

// 2-1. 운동 종목 수정
export async function updateCategory(id: string, updates: Partial<ExerciseCategory>): Promise<void> {
  try {
    await supabase.from('exercise_categories').update(updates).eq('id', id);
  } catch (err) {
    console.warn('Supabase updateCategory error');
  }
}

// 2-2. 운동 종목 삭제
export async function deleteCategory(id: string): Promise<void> {
  try {
    await supabase.from('exercise_categories').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteCategory error');
  }
}


// 3. 특정 일자(Daily Log) 조회 (내 개별 데이터 RLS 격리)
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
      is_public: logData.is_public ?? false,
      likes_count: logData.likes_count || 0,
      comments_count: logData.comments_count || 0,
      records,
    };
  } catch (err) {
    console.warn('Supabase getDailyLogByDate fallback');
    return null;
  }
}

// 4. 일일 기록 저장 (공개 여부 is_public 옵션 포함)
export async function saveDailyLog(logData: {
  date: string;
  weight: number | null;
  memo: string;
  is_public?: boolean;
  records: Omit<ExerciseRecord, 'id' | 'log_id'>[];
}, userId: string = DEFAULT_USER_ID): Promise<DailyLog> {
  const cats = await getCategories(userId);

  try {
    const { data: logRes, error: logErr } = await supabase
      .from('daily_logs')
      .upsert(
        {
          user_id: userId,
          log_date: logData.date,
          weight: logData.weight,
          memo: logData.memo || '',
          is_public: logData.is_public ?? false,
        },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single();

    if (!logErr && logRes) {
      const logId = logRes.id;

      await supabase.from('exercise_records').delete().eq('log_id', logId);

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
    console.warn('Supabase saveDailyLog error');
  }

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
    is_public: logData.is_public ?? false,
    records: formattedRecords,
  };
}

// 5. 공개/비공개 원터치 설정 변경
export async function toggleLogVisibility(logId: string, isPublic: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('daily_logs')
      .update({ is_public: isPublic })
      .eq('id', logId);
    return !error;
  } catch (err) {
    console.error('Toggle visibility error:', err);
    return false;
  }
}

// 6. 거리 기반 이웃 커뮤니티 피드 목록 조회
export async function getCommunityFeed(
  currentUserId?: string,
  userLat?: number | null,
  userLon?: number | null
): Promise<CommunityFeedLog[]> {
  try {
    // 공개 설정된 daily_logs 조회
    const { data: logsData, error: logsErr } = await supabase
      .from('daily_logs')
      .select('*, profiles(id, username, avatar_url, bio, latitude, longitude, location_name)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(30);

    if (logsErr || !logsData) {
      return getDemoCommunityFeed(userLat, userLon);
    }

    const feedLogs: CommunityFeedLog[] = [];

    for (const log of logsData) {
      const { data: recData } = await supabase
        .from('exercise_records')
        .select('*, exercise_categories(name, unit_type)')
        .eq('log_id', log.id);

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

      // 사용자가 좋아요 눌렀는지 확인
      let userHasLiked = false;
      let userReaction = '💪';
      if (currentUserId) {
        const { data: likeData } = await supabase
          .from('cheer_likes')
          .select('*')
          .eq('log_id', log.id)
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (likeData) {
          userHasLiked = true;
          userReaction = likeData.reaction_type || '💪';
        }
      }

      const prof = log.profiles as UserProfile | undefined;
      const distance = calculateDistance(userLat, userLon, prof?.latitude, prof?.longitude);

      feedLogs.push({
        id: log.id,
        user_id: log.user_id,
        log_date: log.log_date,
        weight: log.weight ? Number(log.weight) : null,
        memo: log.memo || '',
        is_public: true,
        likes_count: log.likes_count || 0,
        comments_count: log.comments_count || 0,
        records,
        user_profile: prof,
        distance_km: distance,
        user_has_liked: userHasLiked,
        user_like_reaction: userReaction,
      });
    }

    // 거리순 (가까운 이웃) -> 최신순 정렬
    feedLogs.sort((a, b) => {
      if (typeof a.distance_km === 'number' && typeof b.distance_km === 'number') {
        return a.distance_km - b.distance_km;
      }
      return 0;
    });


    return feedLogs;
  } catch (err) {
    console.warn('Community feed fetch fallback to demo');
    return getDemoCommunityFeed(userLat, userLon);
  }
}

// 7. 데모 이웃 피드 데이터 (DB 연결 미완료 또는 초기 테스트 시)
function getDemoCommunityFeed(userLat?: number | null, userLon?: number | null): CommunityFeedLog[] {
  const baseLat = userLat || 37.5665;
  const baseLon = userLon || 126.9780;

  return [
    {
      id: 'demo-log-1',
      user_id: 'user-demo-1',
      log_date: new Date().toISOString().split('T')[0],
      weight: 71.5,
      memo: '오늘 한강변 야간 5km 달리기 완주! 러너분들 화이팅입니다🔥',
      is_public: true,
      likes_count: 12,
      comments_count: 3,
      user_has_liked: false,
      records: [
        {
          id: 'r-1',
          category_id: 'cat-4',
          category_name: '달리기 (Running)',
          unit_type: 'DISTANCE_TIME',
          sets_data: [],
          total_reps: 0,
          distance_km: 5.2,
          duration_seconds: 1620, // 27분
        },
        {
          id: 'r-2',
          category_id: 'cat-1',
          category_name: '턱걸이 (Pull-up)',
          unit_type: 'SET_REPS',
          sets_data: [{ set: 1, reps: 12 }, { set: 2, reps: 10 }, { set: 3, reps: 8 }],
          total_reps: 30,
          distance_km: 0,
          duration_seconds: 0,
        },
      ],
      user_profile: {
        id: 'user-demo-1',
        username: '마포구 러너',
        bio: '매일 아침/저녁 5km 러닝!',
        is_public: true,
        latitude: baseLat + 0.005, // 약 0.5km 거리
        longitude: baseLon + 0.004,
        location_name: '서울시 마포구',
      },
      distance_km: 0.6,
    },
    {
      id: 'demo-log-2',
      user_id: 'user-demo-2',
      log_date: new Date().toISOString().split('T')[0],
      weight: 68.0,
      memo: '팔굽혀펴기 100회 달성! 몸이 묵직해지네요 💪',
      is_public: true,
      likes_count: 8,
      comments_count: 1,
      user_has_liked: true,
      user_like_reaction: '💪',
      records: [
        {
          id: 'r-3',
          category_id: 'cat-2',
          category_name: '팔굽혀펴기 (Push-up)',
          unit_type: 'SET_REPS',
          sets_data: [{ set: 1, reps: 30 }, { set: 2, reps: 25 }, { set: 3, reps: 25 }, { set: 4, reps: 20 }],
          total_reps: 100,
          distance_km: 0,
          duration_seconds: 0,
        },
      ],
      user_profile: {
        id: 'user-demo-2',
        username: '맨몸운동 메이트',
        bio: '칼리스테닉스 2년차',
        is_public: true,
        latitude: baseLat + 0.012, // 약 1.4km 거리
        longitude: baseLon + 0.010,
        location_name: '서울시 서대문구',
      },
      distance_km: 1.4,
    },
  ];
}

// 8. 응원 누르기 / 취소 (Cheer Like)
export async function toggleCheerLike(logId: string, userId: string, reactionType: string = '💪'): Promise<{ liked: boolean; count: number }> {
  try {
    const { data: existing } = await supabase
      .from('cheer_likes')
      .select('id')
      .eq('log_id', logId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('cheer_likes').delete().eq('id', existing.id);
      // count decrement
      const { data: log } = await supabase.from('daily_logs').select('likes_count').eq('id', logId).single();
      const newCount = Math.max(0, (log?.likes_count || 1) - 1);
      await supabase.from('daily_logs').update({ likes_count: newCount }).eq('id', logId);
      return { liked: false, count: newCount };
    } else {
      await supabase.from('cheer_likes').insert({
        log_id: logId,
        user_id: userId,
        reaction_type: reactionType,
      });
      // count increment
      const { data: log } = await supabase.from('daily_logs').select('likes_count').eq('id', logId).single();
      const newCount = (log?.likes_count || 0) + 1;
      await supabase.from('daily_logs').update({ likes_count: newCount }).eq('id', logId);
      return { liked: true, count: newCount };
    }
  } catch (err) {
    console.error('Toggle cheer like error:', err);
    return { liked: true, count: 1 };
  }
}

// 9. 응원 댓글 조회 및 작성
export async function getCheerComments(logId: string): Promise<CheerComment[]> {
  try {
    const { data, error } = await supabase
      .from('cheer_comments')
      .select('*, profiles(username, avatar_url)')
      .eq('log_id', logId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      return data.map((c: any) => ({
        id: c.id,
        log_id: c.log_id,
        user_id: c.user_id,
        user_name: c.profiles?.username || '이웃 러너',
        user_avatar: c.profiles?.avatar_url || '',
        content: c.content,
        created_at: c.created_at,
      }));
    }
  } catch (err) {
    console.error('Fetch comments error:', err);
  }
  return [];
}

export async function addCheerComment(logId: string, userId: string, content: string): Promise<CheerComment | null> {
  try {
    const { data, error } = await supabase
      .from('cheer_comments')
      .insert({
        log_id: logId,
        user_id: userId,
        content,
      })
      .select('*, profiles(username, avatar_url)')
      .single();

    if (!error && data) {
      // comments_count increment
      const { data: log } = await supabase.from('daily_logs').select('comments_count').eq('id', logId).single();
      await supabase.from('daily_logs').update({ comments_count: (log?.comments_count || 0) + 1 }).eq('id', logId);

      return {
        id: data.id,
        log_id: data.log_id,
        user_id: data.user_id,
        user_name: data.profiles?.username || '나',
        user_avatar: data.profiles?.avatar_url || '',
        content: data.content,
        created_at: data.created_at,
      };
    }
  } catch (err) {
    console.error('Add cheer comment error:', err);
  }
  return null;
}

// 10. 기간별 통계 데이터 조회 (개인 데이터)
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
