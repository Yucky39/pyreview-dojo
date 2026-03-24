import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/supabase-server';
import {
  syncPlanToGoogleCalendar,
  deleteGoogleCalendarEvents,
  createWeeklyStudyReminders,
} from '@/lib/google';
import { decrypt } from '@/lib/encryption';

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { calendarId } = await req.json();
    if (!calendarId) {
      return NextResponse.json({ error: 'calendarId が必要です' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_token')
      .eq('id', user.id)
      .single();

    if (!profile?.google_token) {
      return NextResponse.json(
        { error: 'Google Calendar連携が設定されていません' },
        { status: 400 }
      );
    }

    // 選択したカレンダーIDを保存
    await supabase
      .from('profiles')
      .update({ google_calendar_id: calendarId })
      .eq('id', user.id);

    const tokens = JSON.parse(decrypt(profile.google_token));
    const accessToken = tokens.access_token;

    // 新しいカレンダーへ再同期
    const { data: plan } = await supabase
      .from('learning_plans')
      .select(`*, learning_phases(*, milestones(*))`)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (plan && plan.learning_phases) {
      await deleteGoogleCalendarEvents(accessToken, calendarId, plan.id);
      await syncPlanToGoogleCalendar(accessToken, calendarId, plan, plan.learning_phases);

      if (plan.start_date && plan.end_date) {
        await createWeeklyStudyReminders(
          accessToken,
          calendarId,
          plan.start_date,
          plan.end_date,
          plan.hours_per_week || 10,
          plan.id
        );
      }
    }

    return NextResponse.json({ success: true, calendarId });
  } catch (error) {
    console.error('カレンダー変更エラー:', error);
    return NextResponse.json({ error: 'カレンダーの変更に失敗しました' }, { status: 500 });
  }
}
