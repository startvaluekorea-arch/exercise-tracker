'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { formatDisplayDate, addDays, getTodayString } from '@/lib/dateUtils';

interface DateHeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
}

export default function DateHeader({ currentDate, onDateChange }: DateHeaderProps) {
  const isToday = currentDate === getTodayString();

  const handlePrevDay = () => {
    onDateChange(addDays(currentDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1));
  };

  const handleTodayClick = () => {
    onDateChange(getTodayString());
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="이전 날짜"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-slate-100 font-bold text-base sm:text-lg">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <span>{formatDisplayDate(currentDate)}</span>
          </div>
          {isToday ? (
            <span className="text-xs text-emerald-400 font-medium mt-0.5 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
              오늘 (Today)
            </span>
          ) : (
            <button
              onClick={handleTodayClick}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 mt-0.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              오늘로 이동
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="다음 날짜"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
