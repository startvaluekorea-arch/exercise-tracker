import { NextRequest, NextResponse } from 'next/server';
import { getDailyLogByDate, saveDailyLog } from '@/lib/db';
import { getTodayString } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getTodayString();
    const log = await getDailyLogByDate(date);
    return NextResponse.json(log || { log_date: date, weight: null, memo: '', records: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const savedLog = await saveDailyLog(body);
    return NextResponse.json(savedLog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
