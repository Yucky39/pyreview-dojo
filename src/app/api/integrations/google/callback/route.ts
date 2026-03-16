import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabase } from '@/lib/supabase';
import { syncPlanToGoogleCalendar } from '@/lib/google';
import { getCurrentUser } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=google_auth_failed`
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;

    if (!accessToken) {
      throw new Error('アクセストークンが取得できませんでした');
    }

    // セッションからユーザーIDを取得
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=google_auth_failed`
      );
    }
    const userId = user.id;

    // プロフィールを更新
    await supabase
      .from('profiles')
      .update({
        google_token: JSON.stringify(tokens),
        google_calendar_id: 'primary',
      })
      .eq('id', userId);

    // 学習プランをカレンダーに同期
    const { data: plan } = await supabase
      .from('learning_plans')
      .select(`*, learning_phases(*, milestones(*))`)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (plan && plan.learning_phases) {
      await syncPlanToGoogleCalendar(
        accessToken,
        'primary',
        plan,
        plan.learning_phases
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=google_connected`
    );
  } catch (err) {
    console.error('Googleコールバックエラー:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=google_sync_failed`
    );
  }
}
