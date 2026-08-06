'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

interface SplashLandingProps {
  onComplete: () => void;
}

// 20가지 운동 동기부여 기대효과 리스트
const FITNESS_MOTIVATIONS = [
  { title: "상체 근력 & 활력 증진", subtitle: "매일 10분, 단단하고 아름다운 라인을 만듭니다" },
  { title: "체지방 분해 & 유산소 기분전환", subtitle: "시원하게 달리며 스트레스를 날려보세요" },
  { title: "코어 강화 & 바른 자세 교정", subtitle: "흔들리지 않는 단단한 중심을 완성합니다" },
  { title: "전신 근력 & 신체 밸런스", subtitle: "균형 잡힌 균형감과 에너지를 선사합니다" },
  { title: "기초 대사량 향상 & 체중 조절", subtitle: "더 건강하고 매력적인 신체 변화의 시작" },
  { title: "심폐 지구력 강화", subtitle: "지치지 않는 체력과 맑은 정신을 유지하세요" },
  { title: "하체 탄력 & 힙업 효과", subtitle: "강력한 하체 엔진이 일상의 자신감을 채웁니다" },
  { title: "유연성 증진 & 근육 이완", subtitle: "피로를 풀고 유연하고 편안한 신체를 만듭니다" },
  { title: "엔도르핀 분비 & 긍정 에너지", subtitle: "운동 후 느껴지는 최고의 상쾌함을 경험하세요" },
  { title: "골밀도 강화 & 부상 예방", subtitle: "나이가 들어도 건강하고 젊은 몸을 지킵니다" },
  { title: "혈액 순환 & 맑은 피부 톤", subtitle: "신진대사가 활발해져 생기 넘치는 얼굴을 만듭니다" },
  { title: "집중력 향상 & 뇌 활성화", subtitle: "몸을 움직이면 머리도 한층 맑아집니다" },
  { title: "수면의 질 개선", subtitle: "깊고 편안한 숙면을 취할 수 있도록 도와줍니다" },
  { title: "자신감 상승 & 자기 관리", subtitle: "오늘 하루 목표를 달성한 스스로를 칭찬하세요" },
  { title: "면역력 증진 & 질병 예방", subtitle: "외부 바이러스로부터 내 몸을 든든하게 지킵니다" },
  { title: "체형 관리 & 스타일 완성", subtitle: "어떤 옷을 입어도 돋보이는 핏을 만듭니다" },
  { title: "일상 속 피로 회복", subtitle: "운동을 통한 가벼운 땀방울이 활력을 충전합니다" },
  { title: "스트레스 단번에 날리기", subtitle: "오늘의 답답함을 운동으로 상쾌하게 비워내세요" },
  { title: "목표 달성의 성취감", subtitle: "하나씩 완성해 나가는 운동 일지의 즐거움" },
  { title: "최고의 나를 만드는 시간", subtitle: "오늘도 운동하는 당신이 가장 멋집니다" }
];

export default function SplashLanding({ onComplete }: SplashLandingProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [randomIndex, setRandomIndex] = useState(0);

  useEffect(() => {
    // 1 ~ 20 중 랜덤 인덱스 선택
    const randomNum = Math.floor(Math.random() * 20);
    setRandomIndex(randomNum);

    // 2초 (2000ms) 후 페이드 아웃 시작 후 메인 페이지로 자동 전환
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const motivation = FITNESS_MOTIVATIONS[randomIndex];
  const imageSrc = `/images/fitness_${randomIndex + 1}.png`;

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-5 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 갤럭시 S10 상단 프로그레스 바 (2초 진행 표시) */}
      <div className="w-full max-w-[340px] bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-700/50">
        <div className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 h-full w-full animate-[progress_2s_linear_forwards] origin-left"></div>
      </div>

      {/* 히어로 비주얼 이미지 영역 */}
      <div className="w-full max-w-[340px] flex-1 flex flex-col items-center justify-center my-3 space-y-4 text-center">
        {/* 이미지 프레임 (갤럭시 S10 뷰포트 비율) */}
        <div className="relative w-full aspect-[4/3] max-h-[220px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 group">
          <Image
            src={imageSrc}
            alt="Fitness Workout Visual"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-2 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-200 text-left leading-tight">
              매일의 작은 기록이 건강한 내일을 만듭니다
            </span>
          </div>
        </div>

        {/* 타이틀 및 기대효과 메시지 */}
        <div className="space-y-1.5 px-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-emerald-400 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>운동 기대 효과 #{randomIndex + 1}</span>
          </div>

          <h1 className="text-lg font-black text-slate-100 tracking-tight leading-snug">
            {motivation.title}
          </h1>

          <p className="text-[11px] text-slate-400 leading-relaxed max-w-[300px] mx-auto">
            {motivation.subtitle}
          </p>
        </div>
      </div>

      {/* 하단 스킵 버튼 */}
      <button
        onClick={onComplete}
        className="w-full max-w-[340px] py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-xl text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg mb-1"
      >
        <span>즉시 기록하러 가기</span>
        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
      </button>
    </div>
  );
}
