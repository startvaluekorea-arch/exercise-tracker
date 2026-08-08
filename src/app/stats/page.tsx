'use client';

import { useState, useEffect, useCallback } from 'react';
import { PeriodType } from '@/lib/types';
import { getTodayString } from '@/lib/dateUtils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { BarChart3, Scale, Dumbbell, Calendar, Loader2 } from 'lucide-react';

interface StatsResponse {
  period: PeriodType;
  periodTitle: string;
  startDate: string;
  endDate: string;
  data: any[];
}

export default function StatsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('weekly');
  const [targetDate, setTargetDate] = useState<string>(getTodayString());
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const targetUserId = user?.id || authData?.user?.id;
      const url = targetUserId
        ? `/api/stats?period=${period}&date=${targetDate}&userId=${targetUserId}`
        : `/api/stats?period=${period}&date=${targetDate}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setStatsData(json);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period, targetDate, user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading, fetchStats]);

  // 체중 변화 차트용 데이터 가공
  const weightChartData = statsData?.data
    ? Array.from(
        new Set(statsData.data.filter((d) => d.weight !== null).map((d) => d.log_date))
      ).map((dateStr) => {
        const item = statsData.data.find((d) => d.log_date === dateStr);
        return {
          date: dateStr.slice(5), // MM-DD
          weight: Number(item.weight),
        };
      })
    : [];

  // 종목별 총 수행 횟수/거리 집계
  const exerciseSummary = statsData?.data
    ? statsData.data.reduce((acc: any, cur: any) => {
        if (!cur.category_name) return acc;
        if (!acc[cur.category_name]) {
          acc[cur.category_name] = {
            name: cur.category_name,
            totalReps: 0,
            totalDistance: 0,
            totalDuration: 0,
            unitType: cur.unit_type,
          };
        }
        acc[cur.category_name].totalReps += cur.total_reps || 0;
        acc[cur.category_name].totalDistance += Number(cur.distance_km) || 0;
        acc[cur.category_name].totalDuration += cur.duration_seconds || 0;
        return acc;
      }, {})
    : {};

  const exerciseSummaryList = Object.values(exerciseSummary) as any[];

  // 평균 체중 계산
  const validWeights = weightChartData.map((d) => d.weight);
  const avgWeight =
    validWeights.length > 0
      ? (validWeights.reduce((a, b) => a + b, 0) / validWeights.length).toFixed(1)
      : null;

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* 헤더 */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <BarChart3 className="w-6 h-6 text-emerald-400" />
        <div>
          <h1 className="text-lg font-bold text-slate-100">통계 대시보드</h1>
          <p className="text-xs text-slate-400">주/월/분기/반기/연간 단위 분석</p>
        </div>
      </div>

      {/* 기간 필터 세그먼트 컨트롤 */}
      <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex justify-between gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'weekly', label: '주간(일요일)' },
          { id: 'monthly', label: '월간' },
          { id: 'quarterly', label: '분기' },
          { id: 'half', label: '반기' },
          { id: 'yearly', label: '연간' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id as PeriodType)}
            className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              period === item.id
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 현재 조회 주기 표시 */}
      {statsData && (
        <div className="flex items-center justify-between bg-slate-800/40 border border-slate-800 rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{statsData.periodTitle}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {statsData.startDate} ~ {statsData.endDate}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs">통계 데이터를 계산하는 중...</span>
        </div>
      ) : (
        <>
          {/* 요약 카운터 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>평균 체중</span>
              </div>
              <p className="text-2xl font-black text-cyan-400">
                {avgWeight ? `${avgWeight} kg` : '기록 없음'}
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span>기록된 운동 종목</span>
              </div>
              <p className="text-2xl font-black text-emerald-400">
                {exerciseSummaryList.length} 개
              </p>
            </div>
          </div>

          {/* 몸무게 변화 라인 차트 */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400" />
              체중 변화 추이 (kg)
            </h3>

            {weightChartData.length > 0 ? (
              <div className="w-full h-48 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis
                      domain={['dataMin - 1', 'dataMax + 1']}
                      stroke="#94A3B8"
                      fontSize={10}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderColor: '#475569',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#38BDF8"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#38BDF8' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">
                해당 기간에 기록된 체중 데이터가 없습니다.
              </p>
            )}
          </div>

          {/* 종목별 누적 수행 총계 리스트 */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              종목별 기간 누적 실적
            </h3>

            {exerciseSummaryList.length > 0 ? (
              <div className="space-y-2">
                {exerciseSummaryList.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-200 text-sm">{item.name}</span>
                    <div className="text-right">
                      {item.unitType === 'SET_REPS' && (
                        <span className="text-sm font-black text-emerald-400">
                          총 {item.totalReps} 회
                        </span>
                      )}
                      {item.unitType === 'DISTANCE_TIME' && (
                        <span className="text-sm font-black text-cyan-400">
                          총 {item.totalDistance.toFixed(2)} km
                        </span>
                      )}
                      {item.unitType === 'DURATION' && (
                        <span className="text-sm font-black text-amber-400">
                          총 {Math.floor(item.totalDuration / 60)}분
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">
                해당 기간에 기록된 운동 데이터가 없습니다.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
