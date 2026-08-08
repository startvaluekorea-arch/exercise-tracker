'use client';

import { useState, useEffect, useCallback } from 'react';
import DateHeader from '@/components/DateHeader';
import DailySummaryCard from '@/components/DailySummaryCard';
import DailyRecordForm from '@/components/DailyRecordForm';
import SplashLanding from '@/components/SplashLanding';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { DailyLog, ExerciseCategory } from '@/lib/types';
import { getTodayString, formatDisplayDate } from '@/lib/dateUtils';
import { Loader2, LogIn, User, ShieldCheck, Lock } from 'lucide-react';

export default function HomePage() {
  const { user, profile, isLoading: authLoading } = useAuth();
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
      const { data: authData } = await supabase.auth.getUser();
      const targetUserId = user?.id || authData?.user?.id;
      const url = targetUserId ? `/api/categories?userId=${targetUserId}` : '/api/categories';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  }, [user?.id]);

  // 선택된 날짜의 기록 가져오기
  const fetchDailyLog = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const targetUserId = user?.id || authData?.user?.id;
      const url = targetUserId ? `/api/logs?date=${date}&userId=${targetUserId}` : `/api/logs?date=${date}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: DailyLog = await res.json();
        setDailyLog(data);
        const hasData = Boolean(
          data.id &&
          ((data.weight !== null && data.weight !== undefined) ||
           (data.records && data.records.length > 0) ||
           (data.memo && data.memo.trim() !== ''))
        );
        setIsEditing(!hasData);
      }
    } catch (err) {
      console.error('DailyLog fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchCategories();
      fetchDailyLog(currentDate);
    }
  }, [authLoading, currentDate, fetchCategories, fetchDailyLog]);

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
  };

  const handleSaveSuccess = (savedLog: DailyLog) => {
    setDailyLog(savedLog);
    setIsEditing(false);
  };

  const hasRecordData = Boolean(
    dailyLog &&
    dailyLog.id &&
    ((dailyLog.weight !== null && dailyLog.weight !== undefined) ||
     (dailyLog.records && dailyLog.records.length > 0) ||
     (dailyLog.memo && dailyLog.memo.trim() !== ''))
  );

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
        {!user ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center space-y-4 my-6 shadow-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                로그인 후 운동 기록을 시작해 보세요
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                나만의 매일 운동 실적, 몸무게 추이, 이웃과의 소통 기능을 이용하려면 로그인이 필요합니다.
              </p>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인 / 회원가입 하기</span>
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs">기록을 불러오는 중입니다...</span>
          </div>
        ) : isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-200">
                {hasRecordData
                  ? `${formatDisplayDate(currentDate)} 기록 수정`
                  : `${formatDisplayDate(currentDate)} 운동 기록`}
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
