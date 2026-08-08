import { NextRequest, NextResponse } from 'next/server';
import { getStatsData } from '@/lib/db';
import { getSundayBasedWeekRange, getTodayString, formatDateString } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'weekly';
    const targetDate = searchParams.get('date') || getTodayString();
    const userId = searchParams.get('userId') || undefined;

    let startDate = '';
    let endDate = '';
    let periodTitle = '';

    const currDate = new Date(targetDate + 'T00:00:00');
    const year = currDate.getFullYear();

    if (period === 'weekly') {
      // 일요일 시작 ~ 토요일 종료
      const weekRange = getSundayBasedWeekRange(targetDate);
      startDate = weekRange.startDate;
      endDate = weekRange.endDate;
      periodTitle = `주간 (${startDate} ~ ${endDate})`;
    } else if (period === 'monthly') {
      // 당월 1일 ~ 말일
      const month = currDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      startDate = formatDateString(firstDay);
      endDate = formatDateString(lastDay);
      periodTitle = `${year}년 ${month + 1}월`;
    } else if (period === 'quarterly') {
      // 1분기(1~3월), 2분기(4~6월), 3분기(7~9월), 4분기(10~12월)
      const month = currDate.getMonth();
      const q = Math.floor(month / 3);
      startDate = formatDateString(new Date(year, q * 3, 1));
      endDate = formatDateString(new Date(year, (q + 1) * 3, 0));
      periodTitle = `${year}년 ${q + 1}분기`;
    } else if (period === 'half') {
      // 상반기(1~6월), 하반기(7~12월)
      const month = currDate.getMonth();
      const half = month < 6 ? 0 : 1;
      startDate = formatDateString(new Date(year, half * 6, 1));
      endDate = formatDateString(new Date(year, (half + 1) * 6, 0));
      periodTitle = `${year}년 ${half === 0 ? '상반기' : '하반기'}`;
    } else if (period === 'yearly') {
      // 연간 (1월 1일 ~ 12월 31일)
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
      periodTitle = `${year}년 연간`;
    }

    const rows = await getStatsData(startDate, endDate, userId);

    return NextResponse.json({
      period,
      periodTitle,
      startDate,
      endDate,
      data: rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
