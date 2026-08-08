'use client';

import { useState, useEffect } from 'react';
import { DailyLog, ExerciseCategory, ExerciseRecord, SetData } from '@/lib/types';
import { Scale, Dumbbell, Plus, Trash2, FileText, CheckCircle2, Globe, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [weight, setWeight] = useState<string>(
    initialLog?.weight ? String(initialLog.weight) : ''
  );
  const [memo, setMemo] = useState<string>(initialLog?.memo || '');
  const [isPublic, setIsPublic] = useState<boolean>(initialLog?.is_public ?? false);
  const [recordsMap, setRecordsMap] = useState<{ [categoryId: string]: ExerciseRecord }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
          sets_data: [],
          total_reps: 0,
          distance_km: 0,
          duration_seconds: 0,
        };
      }
    });

    setRecordsMap(initialMap);
    if (initialLog) {
      setIsPublic(initialLog.is_public ?? false);
    }
  }, [categories, initialLog]);

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

  const handleRemoveSet = (catId: string, setIndex: number) => {
    setRecordsMap((prev) => {
      const target = prev[catId];
      if (!target) return prev;
      const filteredSets = (target.sets_data || []).filter((_, idx) => idx !== setIndex);
      const renumberedSets = filteredSets.map((s, idx) => ({ ...s, set: idx + 1 }));
      const totalReps = renumberedSets.reduce((sum, s) => sum + (s.reps || 0), 0);

      return {
        ...prev,
        [catId]: {
          ...target,
          sets_data: renumberedSets,
          total_reps: totalReps,
        },
      };
    });
  };

  const handleRecordFieldChange = (
    catId: string,
    field: 'total_reps' | 'distance_km' | 'duration_seconds',
    val: number
  ) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const recordsToSave = Object.values(recordsMap).filter((r) => {
        if (r.sets_data && r.sets_data.length > 0) return true;
        if (r.total_reps > 0) return true;
        if (r.distance_km > 0) return true;
        if (r.duration_seconds > 0) return true;
        return false;
      });

      const payload = {
        date,
        weight: weight ? parseFloat(weight) : null,
        memo,
        is_public: isPublic,
        records: recordsToSave,
        userId: user?.id,
      };

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedLog = await res.json();
        onSaveSuccess(savedLog);
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Save daily log error:', err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. 공개 / 비공개 설정 토글 */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 space-y-2">
        <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
          <span>공개 / 비공개 설정</span>
          <span className="text-[10px] text-slate-400 font-normal">
            {isPublic ? '🌐 이웃 피드에 공개됨' : '🔒 나만 보기 보호'}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-lg">
          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all ${
              !isPublic
                ? 'bg-slate-700 text-emerald-400 border border-slate-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>🔒 나만 보기</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all ${
              isPublic
                ? 'bg-emerald-500 text-slate-950 shadow shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌐 이웃 피드 공개</span>
          </button>
        </div>
      </div>

      {/* 2. 몸무게 입력 */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Scale className="w-4 h-4 text-emerald-400" />
            <label htmlFor="weight-input">몸무게 (kg)</label>
          </div>
          <span className="text-[10px] text-slate-400">당일 체중 입력</span>
        </div>
        <input
          id="weight-input"
          type="number"
          step="0.1"
          placeholder="예: 72.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg p-2.5 text-slate-100 font-bold text-sm placeholder:text-slate-600 focus:outline-none transition-colors"
        />
      </div>

      {/* 3. 운동 종목 실적 작성 리스트 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>오늘의 운동 실적</span>
          </div>
        </div>

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
              className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <h4 className="font-bold text-slate-100 text-xs sm:text-sm">{cat.name}</h4>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                    {cat.category_tag || '운동'}
                  </span>
                </div>
              </div>

              {/* SET_REPS 세트별 횟수 입력 */}
              {cat.unit_type === 'SET_REPS' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>세트 구성</span>
                    <span>총 횟수: <strong className="text-emerald-400">{rec.total_reps || 0}회</strong></span>
                  </div>

                  {rec.sets_data && rec.sets_data.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {rec.sets_data.map((setData, setIdx) => (
                        <div
                          key={setIdx}
                          className="flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5"
                        >
                          <span className="text-[11px] font-semibold text-slate-300">
                            {setData.set}세트
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={setData.reps}
                              onChange={(e) =>
                                handleSetRepsChange(cat.id, setIdx, parseInt(e.target.value) || 0)
                              }
                              className="w-12 bg-slate-800 border border-slate-600 focus:border-emerald-400 rounded text-center text-xs font-bold text-emerald-400 py-0.5 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400">회</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(cat.id, setIdx)}
                              className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddSet(cat.id)}
                    className="w-full py-2 bg-slate-900/60 hover:bg-slate-700/60 border border-dashed border-slate-700 text-slate-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>세트 추가 (+1)</span>
                  </button>
                </div>
              )}

              {/* TOTAL_REPS 총 횟수만 입력 */}
              {cat.unit_type === 'TOTAL_REPS' && (
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">
                    총 수행 횟수
                  </label>
                  <input
                    type="number"
                    placeholder="예: 50"
                    value={rec.total_reps || ''}
                    onChange={(e) =>
                      handleRecordFieldChange(cat.id, 'total_reps', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg py-1.5 px-2 text-emerald-400 text-xs font-bold focus:outline-none"
                  />
                </div>
              )}

              {/* DISTANCE_TIME 거리 + 시간 입력 */}
              {cat.unit_type === 'DISTANCE_TIME' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium block mb-1">
                      거리 (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="예: 5.0"
                      value={rec.distance_km || ''}
                      onChange={(e) =>
                        handleRecordFieldChange(cat.id, 'distance_km', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg py-1.5 px-2 text-cyan-400 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium block mb-1">
                      시간 (분)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="예: 25분"
                      value={rec.duration_seconds ? Number((rec.duration_seconds / 60).toFixed(1)) : ''}
                      onChange={(e) => {
                        const mins = parseFloat(e.target.value) || 0;
                        handleRecordFieldChange(cat.id, 'duration_seconds', Math.round(mins * 60));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg py-1.5 px-2 text-cyan-400 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* DURATION 시간 입력 */}
              {cat.unit_type === 'DURATION' && (
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">
                    수행 시간 (분)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="예: 3분"
                    value={rec.duration_seconds ? Number((rec.duration_seconds / 60).toFixed(1)) : ''}
                    onChange={(e) => {
                      const mins = parseFloat(e.target.value) || 0;
                      handleRecordFieldChange(cat.id, 'duration_seconds', Math.round(mins * 60));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg py-1.5 px-2 text-amber-400 text-xs font-bold focus:outline-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 메모 */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <label htmlFor="memo-input" className="font-bold text-slate-100 text-xs">
            오늘의 메모 / 컨디션
          </label>
        </div>
        <textarea
          id="memo-input"
          rows={2}
          placeholder="오늘의 컨디션을 기록하세요..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg p-2.5 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* 저장 / 취소 버튼 */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <span>저장 중...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>오늘 기록 저장하기 ({isPublic ? '🌐 공개' : '🔒 비공개'})</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
