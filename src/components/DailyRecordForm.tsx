'use client';

import { useState, useEffect } from 'react';
import { DailyLog, ExerciseCategory, ExerciseRecord, SetData } from '@/lib/types';
import { Scale, Dumbbell, Plus, Trash2, Save, FileText, CheckCircle2 } from 'lucide-react';

interface DailyRecordFormProps {
  date: string;
  initialLog: DailyLog | null;
  categories: ExerciseCategory[];
  onSaveSuccess: (savedLog: DailyLog) => void;
  onCancel?: () => void;
}

export default function DailyRecordForm({
  date,
  initialLog,
  categories,
  onSaveSuccess,
  onCancel,
}: DailyRecordFormProps) {
  const [weight, setWeight] = useState<string>(
    initialLog?.weight ? String(initialLog.weight) : ''
  );
  const [memo, setMemo] = useState<string>(initialLog?.memo || '');
  const [recordsMap, setRecordsMap] = useState<{ [categoryId: string]: ExerciseRecord }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 활성화된 운동 종목으로 recordsMap 초기화
  useEffect(() => {
    const activeCats = categories.filter((c) => c.is_active);
    const initialMap: { [catId: string]: ExerciseRecord } = {};

    activeCats.forEach((cat) => {
      const existingRec = initialLog?.records?.find((r) => r.category_id === cat.id);
      if (existingRec) {
        initialMap[cat.id] = { ...existingRec };
      } else {
        initialMap[cat.id] = {
          category_id: cat.id,
          category_name: cat.name,
          unit_type: cat.unit_type,
          sets_data: cat.unit_type === 'SET_REPS' ? [] : [],
          total_reps: 0,
          distance_km: 0,
          duration_seconds: 0,
        };
      }
    });

    setRecordsMap(initialMap);
  }, [categories, initialLog]);

  // 세트 추가
  const handleAddSet = (catId: string) => {
    setRecordsMap((prev) => {
      const target = prev[catId];
      if (!target) return prev;
      const currentSets = target.sets_data || [];
      const newSetNumber = currentSets.length + 1;
      const lastReps = currentSets.length > 0 ? currentSets[currentSets.length - 1].reps : 10;
      
      const newSets: SetData[] = [...currentSets, { set: newSetNumber, reps: lastReps }];
      const totalReps = newSets.reduce((sum, s) => sum + (s.reps || 0), 0);

      return {
        ...prev,
        [catId]: {
          ...target,
          sets_data: newSets,
          total_reps: totalReps,
        },
      };
    });
  };

  // 세트 횟수 변경
  const handleSetRepsChange = (catId: string, setIndex: number, repsVal: number) => {
    setRecordsMap((prev) => {
      const target = prev[catId];
      if (!target) return prev;
      const updatedSets = [...(target.sets_data || [])];
      updatedSets[setIndex] = { ...updatedSets[setIndex], reps: repsVal };
      const totalReps = updatedSets.reduce((sum, s) => sum + (s.reps || 0), 0);

      return {
        ...prev,
        [catId]: {
          ...target,
          sets_data: updatedSets,
          total_reps: totalReps,
        },
      };
    });
  };

  // 세트 삭제
  const handleRemoveSet = (catId: string, setIndex: number) => {
    setRecordsMap((prev) => {
      const target = prev[catId];
      if (!target) return prev;
      const updatedSets = (target.sets_data || [])
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, set: idx + 1 }));
      const totalReps = updatedSets.reduce((sum, s) => sum + (s.reps || 0), 0);

      return {
        ...prev,
        [catId]: {
          ...target,
          sets_data: updatedSets,
          total_reps: totalReps,
        },
      };
    });
  };

  // 유산소/시간형 필드 변경
  const handleRecordFieldChange = (catId: string, field: 'distance_km' | 'duration_seconds', val: number) => {
    setRecordsMap((prev) => {
      const target = prev[catId];
      if (!target) return prev;
      return {
        ...prev,
        [catId]: {
          ...target,
          [field]: val,
        },
      };
    });
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const validRecords = Object.values(recordsMap).filter((r) => {
        if (r.unit_type === 'SET_REPS') return r.sets_data && r.sets_data.length > 0;
        if (r.unit_type === 'DISTANCE_TIME') return r.distance_km > 0 || r.duration_seconds > 0;
        if (r.unit_type === 'DURATION') return r.duration_seconds > 0;
        return r.total_reps > 0;
      });

      const payload = {
        date,
        weight: weight ? parseFloat(weight) : null,
        memo,
        records: validRecords,
      };

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('저장 실패');
      const savedLog = await res.json();
      onSaveSuccess(savedLog);
    } catch (err) {
      alert('기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* 몸무게 입력 */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <label htmlFor="weight-input" className="font-bold text-slate-100 text-sm">
            오늘의 몸무게 (kg)
          </label>
        </div>
        <div className="relative">
          <input
            id="weight-input"
            type="number"
            step="0.1"
            placeholder="예: 72.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-3 px-4 text-cyan-400 text-xl font-black placeholder:text-slate-600 focus:outline-none transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
            kg
          </span>
        </div>
      </div>

      {/* 운동 종목 기록 리스트 */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
          <Dumbbell className="w-4 h-4 text-emerald-400" />
          운동 세부 기록
        </h3>

        {activeCategories.map((cat) => {
          const rec = recordsMap[cat.id] || {
            category_id: cat.id,
            category_name: cat.name,
            unit_type: cat.unit_type,
            sets_data: [],
            total_reps: 0,
            distance_km: 0,
            duration_seconds: 0,
          };

          return (
            <div
              key={cat.id}
              className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {cat.name}
                </span>
                <span className="text-[11px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">
                  {cat.category_tag || '운동'}
                </span>
              </div>

              {/* SET_REPS 타입 세트 입력 */}
              {cat.unit_type === 'SET_REPS' && (
                <div className="space-y-2">
                  <div className="space-y-2">
                    {rec.sets_data?.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-semibold w-12">
                          {s.set}세트
                        </span>
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={s.reps}
                            onChange={(e) =>
                              handleSetRepsChange(cat.id, idx, parseInt(e.target.value) || 0)
                            }
                            className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg py-1.5 px-3 text-emerald-400 text-sm font-bold text-center focus:outline-none"
                          />
                          <span className="text-xs text-slate-400 font-medium">회</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(cat.id, idx)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSet(cat.id)}
                    className="w-full py-2 bg-slate-900/80 hover:bg-slate-700/60 border border-dashed border-slate-700 hover:border-emerald-500/50 text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>세트 추가</span>
                  </button>
                </div>
              )}

              {/* DISTANCE_TIME 유산소 입력 */}
              {cat.unit_type === 'DISTANCE_TIME' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      이동 거리 (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.0"
                      value={rec.distance_km || ''}
                      onChange={(e) =>
                        handleRecordFieldChange(cat.id, 'distance_km', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg py-2 px-3 text-cyan-400 text-sm font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      운동 시간 (분)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={rec.duration_seconds ? Math.floor(rec.duration_seconds / 60) : ''}
                      onChange={(e) =>
                        handleRecordFieldChange(
                          cat.id,
                          'duration_seconds',
                          (parseInt(e.target.value) || 0) * 60
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg py-2 px-3 text-cyan-400 text-sm font-bold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* DURATION 시간만 입력 */}
              {cat.unit_type === 'DURATION' && (
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    수행 시간 (초)
                  </label>
                  <input
                    type="number"
                    placeholder="예: 60초 (1분)"
                    value={rec.duration_seconds || ''}
                    onChange={(e) =>
                      handleRecordFieldChange(cat.id, 'duration_seconds', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg py-2 px-3 text-amber-400 text-sm font-bold focus:outline-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 일일 메모 */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <label htmlFor="memo-input" className="font-bold text-slate-100 text-sm">
            오늘의 메모 / 컨디션
          </label>
        </div>
        <textarea
          id="memo-input"
          rows={3}
          placeholder="오늘의 컨디션이나 피드백을 기록하세요..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl p-3 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* 하단 저장 / 취소 액션 버튼 */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <span>저장 중...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>오늘 기록 저장하기</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
