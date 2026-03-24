import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/supabase-server';
import { listGoogleCalendars } from '@/lib/google';
import { decrypt } from '@/lib/encryption';

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
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

    const tokens = JSON.parse(decrypt(profile.google_token));
    const calendars = await listGoogleCalendars(tokens.access_token);

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error('カレンダー一覧取得エラー:', error);
    return NextResponse.json({ error: 'カレンダー一覧の取得に失敗しました' }, { status: 500 });
  }
}
