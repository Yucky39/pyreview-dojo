import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { syncPlanToGoogleCalendar } from '@/lib/google';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

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

    const tokens = JSON.parse(profile.google_token);
    const accessToken = tokens.access_token;

    const { data: plan } = await supabase
      .from('learning_plans')
      .select(`*, learning_phases(*, milestones(*))`)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!plan) {
      return NextResponse.json({ error: '学習プランが見つかりません' }, { status: 404 });
    }

    await syncPlanToGoogleCalendar(
      accessToken,
      profile.google_calendar_id || 'primary',
      plan,
      plan.learning_phases
    );

    return NextResponse.json({ success: true, message: 'Google Calendarに同期しました' });
  } catch (error) {
    console.error('Google同期エラー:', error);
    return NextResponse.json({ error: '同期に失敗しました' }, { status: 500 });
  }
}
