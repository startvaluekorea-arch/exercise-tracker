'use client';

import { DailyLog } from '@/lib/types';
import { formatDuration } from '@/lib/dateUtils';
import { Scale, Edit3, Dumbbell, Activity, CalendarCheck } from 'lucide-react';

interface DailySummaryCardProps {
  log: DailyLog;
  onEditClick: () => void;
}

export default function DailySummaryCard({ log, onEditClick }: DailySummaryCardProps) {
  const hasRecords = log.records && log.records.length > 0;
  const hasWeight = log.weight !== null && log.weight !== undefined;

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 backdrop-blur-sm shadow-xl space-y-5">
      {/* 카드 상단 헤더 */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-950/80 border border-emerald-800/50 rounded-xl">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">오늘의 운동 일지 완료</h3>
            <p className="text-xs text-slate-400">기록이 성공적으로 저장되어 있습니다</p>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-950/40"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>수정하기</span>
        </button>
      </div>

      {/* 몸무게 섹션 */}
      {hasWeight && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">오늘의 몸무게</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-cyan-400">{log.weight}</span>
            <span className="text-xs font-semibold text-slate-400">kg</span>
          </div>
        </div>
      )}

      {/* 운동 수행 실적 리스트 */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
          수행한 운동 ({log.records?.length || 0}개)
        </h4>

        {hasRecords ? (
          <div className="space-y-2.5">
            {log.records.map((rec, idx) => (
              <div
                key={rec.id || idx}
                className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-sm">{rec.category_name}</span>
                  {rec.unit_type === 'SET_REPS' && (
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
                      총 {rec.total_reps}회
                    </span>
                  )}
                  {rec.unit_type === 'DISTANCE_TIME' && (
                    <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-md font-semibold">
                      {rec.distance_km} km / {formatDuration(rec.duration_seconds)}
                    </span>
                  )}
                  {rec.unit_type === 'DURATION' && (
                    <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-md font-semibold">
                      {formatDuration(rec.duration_seconds)}
                    </span>
                  )}
                </div>

                {/* 세트별 상세 펼침 표기 */}
                {rec.unit_type === 'SET_REPS' && rec.sets_data && rec.sets_data.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rec.sets_data.map((s) => (
                      <span
                        key={s.set}
                        className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {s.set}세트: <strong className="text-emerald-400">{s.reps}회</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-2">등록된 운동 기록이 없습니다.</p>
        )}
      </div>

      {/* 일일 메모 */}
      {log.memo && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
          <span className="text-xs text-slate-400 font-semibold block mb-1">📝 메모</span>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{log.memo}</p>
        </div>
      )}
    </div>
  );
}
