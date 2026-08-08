'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { formatDisplayDate, addDays, getTodayString, getSundayBasedWeekRange, WEEKDAYS } from '@/lib/dateUtils';

interface DateHeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
}

export default function DateHeader({ currentDate, onDateChange }: DateHeaderProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const isToday = currentDate === getTodayString();
  const weekInfo = getSundayBasedWeekRange(currentDate);

  const handlePrevDay = () => {
    onDateChange(addDays(currentDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1));
  };

  const handleTodayClick = () => {
    onDateChange(getTodayString());
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if ('showPicker' in dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      {/* 1. 상단 날짜 및 달력 선택 바 */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="이전 날짜"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          {/* 달력 선택 가능한 날짜 표시 */}
          <div 
            onClick={handleCalendarClick}
            className="flex items-center gap-1.5 text-slate-100 font-bold text-sm sm:text-base tracking-tight cursor-pointer hover:text-emerald-400 transition-colors bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-700/60"
            title="클릭하여 날짜 변경"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{formatDisplayDate(currentDate)}</span>
            {/* Hidden HTML5 Date Input */}
            <input
              ref={dateInputRef}
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) onDateChange(e.target.value);
              }}
              className="sr-only"
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            {isToday ? (
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
                오늘 (Today)
              </span>
            ) : (
              <button
                onClick={handleTodayClick}
                className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700"
              >
                <RotateCcw className="w-3 h-3" />
                오늘로 이동
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleNextDay}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="다음 날짜"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. 주간 7일 날짜 선택 탭 (어제, 그저께, 내일, 모레 손쉽게 이동) */}
      <div className="px-2 pb-2 grid grid-cols-7 gap-1 max-w-md mx-auto">
        {weekInfo.days.map((dayStr, idx) => {
          const isSelected = dayStr === currentDate;
          const isDayToday = dayStr === getTodayString();
          const dayNum = parseInt(dayStr.split('-')[2], 10);

          return (
            <button
              key={dayStr}
              type="button"
              onClick={() => onDateChange(dayStr)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl border text-xs transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-extrabold border-emerald-400 shadow-md shadow-emerald-950/50 scale-105'
                  : isDayToday
                  ? 'bg-emerald-950/40 text-emerald-400 font-bold border-emerald-800/80'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="text-[10px] opacity-80">{WEEKDAYS[idx]}</span>
              <span className="text-xs font-black">{dayNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
