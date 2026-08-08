'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExerciseCategory, UnitType } from '@/lib/types';
import { Dumbbell, Plus, Eye, EyeOff, Trash2, CheckCircle, Tag, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ExercisesPage() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [unitType, setUnitType] = useState<UnitType>('SET_REPS');
  const [categoryTag, setCategoryTag] = useState<string>('상체');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = user?.id ? `/api/categories?userId=${user.id}` : '/api/categories';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchCategories();
    }
  }, [authLoading, fetchCategories]);

  // 새 운동 종목 추가
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 종목을 추가해 주세요.');
      return;
    }
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          unit_type: unitType,
          category_tag: categoryTag,
          userId: user.id,
        }),
      });

      if (res.ok) {
        setName('');
        setShowAddForm(false);
        fetchCategories();
      }
    } catch (err) {
      alert('운동 종목 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 활성화/숨김 상태 토글
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // 종목 삭제
  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (!confirm(`'${catName}' 종목을 정말 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-lg font-bold text-slate-100">운동 종목 관리</h1>
            <p className="text-xs text-slate-400">자유로운 종목 추가, 숨김 및 삭제</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>새 종목</span>
        </button>
      </div>

      {/* 새 종목 추가 폼 */}
      {showAddForm && (
        <form
          onSubmit={handleAddCategory}
          className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 space-y-4 shadow-xl"
        >
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            새 운동 종목 등록
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">
              운동 명칭
            </label>
            <input
              type="text"
              placeholder="예: 딥스, 케틀벨 스윙, 런닝"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl p-3 text-slate-100 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                측정 단위 타입
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as UnitType)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none"
              >
                <option value="SET_REPS">세트 x 횟수 (턱걸이 등)</option>
                <option value="DISTANCE_TIME">거리 + 시간 (달리기 등)</option>
                <option value="DURATION">시간만 (플랭크 등)</option>
                <option value="TOTAL_REPS">총 횟수만</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                부위 / 태그
              </label>
              <select
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none"
              >
                <option value="상체">상체</option>
                <option value="하체">하체</option>
                <option value="코어">코어</option>
                <option value="유산소">유산소</option>
                <option value="전신">전신</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>종목 추가하기</span>
            </button>
          </div>
        </form>
      )}

      {/* 운동 종목 리스트 */}
      {authLoading || isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs">운동 종목을 가져오는 중...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-slate-800/80 border rounded-2xl p-4 flex items-center justify-between transition-all ${
                cat.is_active
                  ? 'border-slate-700/70'
                  : 'border-slate-800 opacity-60 bg-slate-900/50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">{cat.name}</span>
                  {!cat.is_active && (
                    <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                      숨김 됨
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px] bg-slate-900 px-2 py-0.5 rounded text-emerald-400">
                    <Tag className="w-3 h-3" />
                    {cat.category_tag || '운동'}
                  </span>
                  <span className="text-[11px]">
                    {cat.unit_type === 'SET_REPS' && '세트/횟수'}
                    {cat.unit_type === 'DISTANCE_TIME' && '거리/시간'}
                    {cat.unit_type === 'DURATION' && '시간만'}
                    {cat.unit_type === 'TOTAL_REPS' && '총 횟수'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(cat.id, cat.is_active)}
                  className={`p-2 rounded-xl border transition-colors ${
                    cat.is_active
                      ? 'bg-slate-700/50 border-slate-600 text-emerald-400 hover:text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                  title={cat.is_active ? '기록 폼에서 숨기기' : '기록 폼에 표시'}
                >
                  {cat.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-900/50 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
