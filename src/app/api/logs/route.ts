import { NextRequest, NextResponse } from 'next/server';
import { getDailyLogByDate, saveDailyLog, DEFAULT_USER_ID } from '@/lib/db';
import { getTodayString } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getTodayString();
    const userId = searchParams.get('userId') || DEFAULT_USER_ID;

    const log = await getDailyLogByDate(date, userId);
    return NextResponse.json(log || { log_date: date, weight: null, memo: '', is_public: false, records: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || DEFAULT_USER_ID;

    const savedLog = await saveDailyLog(
      {
        date: body.date,
        weight: body.weight,
        memo: body.memo,
        is_public: body.is_public ?? false,
        records: body.records || [],
      },
      userId
    );
    return NextResponse.json(savedLog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
