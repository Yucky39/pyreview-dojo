import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  syncPlanToGoogleCalendar,
  deleteGoogleCalendarEvents,
  createWeeklyStudyReminders,
} from '@/lib/google';
import { decrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    const body = await req.json().catch(() => ({}));
    const enableWeeklyReminders: boolean = body.enableWeeklyReminders ?? false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('google_token, google_calendar_id')
      .eq('id', userId)
      .single();

    if (!profile?.google_token) {
      return NextResponse.json(
        { error: 'Google Calendar連携が設定されていません' },
        { status: 400 }
      );
    }

    const tokens = JSON.parse(decrypt(profile.google_token));
    const accessToken = tokens.access_token;
    const calendarId = profile.google_calendar_id || 'primary';

    const { data: plan } = await supabase
      .from('learning_plans')
      .select(`*, learning_phases(*, milestones(*))`)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!plan) {
      return NextResponse.json({ error: '学習プランが見つかりません' }, { status: 404 });
    }

    // 既存イベントを削除してから再作成（upsert）
    await deleteGoogleCalendarEvents(accessToken, calendarId, plan.id);
    await syncPlanToGoogleCalendar(accessToken, calendarId, plan, plan.learning_phases);

    if (enableWeeklyReminders && plan.start_date && plan.end_date) {
      await createWeeklyStudyReminders(
        accessToken,
        calendarId,
        plan.start_date,
        plan.end_date,
        plan.hours_per_week || 10,
        plan.id
      );
    }

    return NextResponse.json({ success: true, message: 'Google Calendarに同期しました' });
  } catch (error) {
    console.error('Google同期エラー:', error);
    return NextResponse.json({ error: '同期に失敗しました' }, { status: 500 });
  }
}
