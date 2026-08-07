'use client';

import { useState, useEffect, useCallback } from 'react';
import DateHeader from '@/components/DateHeader';
import DailySummaryCard from '@/components/DailySummaryCard';
import DailyRecordForm from '@/components/DailyRecordForm';
import SplashLanding from '@/components/SplashLanding';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { DailyLog, ExerciseCategory } from '@/lib/types';
import { getTodayString } from '@/lib/dateUtils';
import { Loader2, LogIn, User, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { user, profile } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<string>(getTodayString());
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // 운동 종목 목록 가져오기
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  }, []);

  // 선택된 날짜의 기록 가져오기
  const fetchDailyLog = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/logs?date=${date}`);
      if (res.ok) {
        const data: DailyLog = await res.json();
        setDailyLog(data);
        const hasData = (data.weight !== null && data.weight !== undefined) || (data.records && data.records.length > 0);
        setIsEditing(!hasData);
      }
    } catch (err) {
      console.error('DailyLog fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchDailyLog(currentDate);
  }, [currentDate, fetchDailyLog]);

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
  };

  const handleSaveSuccess = (savedLog: DailyLog) => {
    setDailyLog(savedLog);
    setIsEditing(false);
  };

  const hasRecordData = dailyLog && ((dailyLog.weight !== null && dailyLog.weight !== undefined) || (dailyLog.records && dailyLog.records.length > 0));

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* 1초 스플래시 랜딩 연동 */}
      {showSplash && (
        <SplashLanding onComplete={() => setShowSplash(false)} />
      )}

      {/* 상단 퀵 로그인 / 회원가입 서브 헤더 바 */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-[11px]">
            {user ? `👋 ${profile?.username || '러너'}님 (RLS 전용 로그인)` : '개인 데이터 보안 보호 중'}
          </span>
        </div>

        {user ? (
          <a
            href="/profile"
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20"
          >
            <User className="w-3 h-3" />
            <span>내 프로필</span>
          </a>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-2.5 py-0.5 rounded-full shadow transition-all"
          >
            <LogIn className="w-3 h-3" />
            <span>로그인 / 회원가입</span>
          </button>
        )}
      </div>

      {/* 날짜 헤더 */}
      <DateHeader currentDate={currentDate} onDateChange={handleDateChange} />

      {/* 본문 콘텐츠 영역 */}
      <div className="p-4 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs">기록을 불러오는 중입니다...</span>
          </div>
        ) : isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-200">
                {hasRecordData ? '오늘의 기록 수정' : '오늘의 운동 & 몸무게 기록'}
              </h2>
              {hasRecordData && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  요약 보기로 돌아가기
                </button>
              )}
            </div>
            <DailyRecordForm
              date={currentDate}
              initialLog={dailyLog}
              categories={categories}
              onSaveSuccess={handleSaveSuccess}
              onCancel={hasRecordData ? () => setIsEditing(false) : undefined}
            />
          </div>
        ) : (
          dailyLog && (
            <DailySummaryCard
              log={dailyLog}
              onEditClick={() => setIsEditing(true)}
            />
          )
        )}
      </div>

      {/* 로그인 모달 */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
