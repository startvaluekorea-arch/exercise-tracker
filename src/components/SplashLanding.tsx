'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

interface SplashLandingProps {
  onComplete: () => void;
}

export default function SplashLanding({ onComplete }: SplashLandingProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1초(1000ms) 후 페이드 아웃 시작 후 메인 페이지로 자동 전환
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 300); // 300ms 페이드아웃 애니메이션
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 상단 프로그레스 바 (1초 진행 표시) */}
      <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4 border border-slate-700/50">
        <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full w-full animate-[progress_1s_linear_forwards] origin-left"></div>
      </div>

      {/* 히어로 히스토리 & 비주얼 이미지 영역 */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center my-6 space-y-6 text-center">
        {/* 이미지 프레임 */}
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 group">
          <Image
            src="/images/fitness_woman_landing.png"
            alt="Fitness Woman Workout"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-2.5 rounded-2xl">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-200 text-left leading-tight">
              매일의 작은 기록이 건강한 내일을 만듭니다
            </span>
          </div>
        </div>

        {/* 타이틀 및 기대효과 메시지 */}
        <div className="space-y-2 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>오늘의 운동 기대 효과</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-snug">
            꾸준한 운동은 <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              에너지와 건강한 변화
            </span>를 가져옵니다
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            체중 관리 ⦁ 신체 활력 증진 ⦁ 근력 강화 ⦁ 스트레스 해소
          </p>
        </div>
      </div>

      {/* 하단 스킵 버튼 */}
      <button
        onClick={onComplete}
        className="w-full max-w-xs py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
      >
        <span>즉시 기록하러 가기</span>
        <ArrowRight className="w-4 h-4 text-emerald-400" />
      </button>
    </div>
  );
}
