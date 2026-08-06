// 일요일 시작 주간 계산 및 기간 유틸리티

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// YYYY-MM-DD 스트링으로 변환 (로컬 타임존 고려)
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 화면 표시용 날짜 (예: 2026년 8월 6일 (목))
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = WEEKDAYS[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

// 주어진 날짜 기준 일요일 시작~토요일 종료 주간 범위 구하기
export function getSundayBasedWeekRange(targetDateStr: string): { startDate: string; endDate: string; days: string[] } {
  const target = new Date(targetDateStr + 'T00:00:00');
  const dayOfWeek = target.getDay(); // 0(Sun) ~ 6(Sat)
  
  // 일요일로 이동
  const sun = new Date(target);
  sun.setDate(target.getDate() - dayOfWeek);
  
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    days.push(formatDateString(d));
  }
  
  return {
    startDate: days[0], // 일요일
    endDate: days[6],   // 토요일
    days
  };
}

// 오늘 날짜 가져오기 (YYYY-MM-DD)
export function getTodayString(): string {
  return formatDateString(new Date());
}

// 날짜 이동 (daysDelta일 만큼 더하거나 뺌)
export function addDays(dateStr: string, daysDelta: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + daysDelta);
  return formatDateString(date);
}

// 초 단위 시간을 분:초 형식으로 표시 (예: 125초 -> 2분 5초)
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0초';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초`;
  if (s === 0) return `${m}분`;
  return `${m}분 ${s}초`;
}
