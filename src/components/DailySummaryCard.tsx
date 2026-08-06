'use client';

import { DailyLog } from '@/lib/types';
import { formatDuration } from '@/lib/dateUtils';
import { Scale, Edit3, Dumbbell, CalendarCheck } from 'lucide-react';

interface DailySummaryCardProps {
  log: DailyLog;
  onEditClick: () => void;
}

export default function DailySummaryCard({ log, onEditClick }: DailySummaryCardProps) {
  const hasRecords = log.records && log.records.length > 0;
  const hasWeight = log.weight !== null && log.weight !== undefined;

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 backdrop-blur-sm shadow-xl space-y-4">
      {/* 헤더 영역 - 갤럭시 S10 360px 한 줄 피트 최적화 */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-emerald-950/80 border border-emerald-800/50 rounded-xl shrink-0">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-100 text-xs sm:text-sm tracking-tight whitespace-nowrap">
              오늘의 운동 일지 완료
            </h3>
            <p className="text-[10px] text-slate-400 truncate">
              기록이 성공적으로 저장되어 있습니다
            </p>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-950/40 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>수정</span>
        </button>
      </div>

      {/* 체중 요약 */}
      {hasWeight && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">오늘의 몸무게</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-cyan-400">{log.weight}</span>
            <span className="text-xs font-semibold text-slate-400">kg</span>
          </div>
        </div>
      )}

      {/* 운동 종목 목록 */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1">
          <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
          수행한 운동 ({log.records?.length || 0}개)
        </h4>

        {hasRecords ? (
          <div className="space-y-2">
            {log.records.map((rec, idx) => (
              <div
                key={rec.id || idx}
                className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs sm:text-sm">{rec.category_name}</span>
                  {rec.unit_type === 'SET_REPS' && (
                    <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
                      총 {rec.total_reps}회
                    </span>
                  )}
                  {rec.unit_type === 'DISTANCE_TIME' && (
                    <span className="text-[11px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-md font-semibold">
                      {rec.distance_km} km / {formatDuration(rec.duration_seconds)}
                    </span>
                  )}
                  {rec.unit_type === 'DURATION' && (
                    <span className="text-[11px] bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-md font-semibold">
                      {formatDuration(rec.duration_seconds)}
                    </span>
                  )}
                </div>

                {rec.unit_type === 'SET_REPS' && rec.sets_data && rec.sets_data.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {rec.sets_data.map((s) => (
                      <span
                        key={s.set}
                        className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
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
          <p className="text-xs text-slate-500 py-1">등록된 운동 기록이 없습니다.</p>
        )}
      </div>

      {/* 메모 요약 */}
      {log.memo && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">📝 메모</span>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{log.memo}</p>
        </div>
      )}
    </div>
  );
}
