import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/supabase-server';

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { platform } = await req.json();

    if (platform !== 'notion' && platform !== 'google') {
      return NextResponse.json({ error: '無効なプラットフォームです' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const updateData: Record<string, null> = {};
    if (platform === 'notion') {
      updateData.notion_token = null;
      updateData.notion_database_id = null;
    } else {
      updateData.google_token = null;
      updateData.google_calendar_id = null;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('連携解除エラー:', error);
    return NextResponse.json({ error: '連携解除に失敗しました' }, { status: 500 });
  }
}
