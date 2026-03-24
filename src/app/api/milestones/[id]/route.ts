import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/supabase-server';
import { updateMilestoneInNotion } from '@/lib/notion';
import { addMilestoneCompletedEvent } from '@/lib/google';
import { decrypt } from '@/lib/encryption';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // マイルストーンの存在確認（RLSでユーザー所有確認）
    const { data: milestone, error: findError } = await supabase
      .from('milestones')
      .select('id, title, status, phase_id, description, due_date')
      .eq('id', id)
      .single();

    if (findError || !milestone) {
      return NextResponse.json(
        { error: 'マイルストーンが見つかりません' },
        { status: 404 }
      );
    }

    if (milestone.status === 'completed') {
      return NextResponse.json(
        { error: 'このマイルストーンはすでに完了しています' },
        { status: 400 }
      );
    }

    // マイルストーンを完了に更新
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('milestones')
      .update({ status: 'completed', completed_at: now })
      .eq('id', id);

    if (updateError) {
      console.error('マイルストーン更新エラー:', updateError);
      return NextResponse.json(
        { error: 'マイルストーンの更新に失敗しました' },
        { status: 500 }
      );
    }

    // 連携チェック（設定済みの場合は自動同期）
    const { data: profile } = await supabase
      .from('profiles')
      .select('notion_token, notion_database_id, google_token, google_calendar_id')
      .eq('id', user.id)
      .single();

    let notionSynced = false;
    if (profile?.notion_token && profile?.notion_database_id) {
      try {
        const notionToken = decrypt(profile.notion_token);
        await updateMilestoneInNotion(
          notionToken,
          profile.notion_database_id,
          milestone.title,
          now,
          '完了'
        );
        notionSynced = true;
      } catch (notionError) {
        // Notion同期の失敗はメイン処理に影響させない
        console.error('Notion自動同期エラー:', notionError);
      }
    }

    let googleSynced = false;
    if (profile?.google_token && profile?.google_calendar_id) {
      try {
        const tokens = JSON.parse(decrypt(profile.google_token));
        await addMilestoneCompletedEvent(
          tokens.access_token,
          profile.google_calendar_id,
          milestone,
          now
        );
        googleSynced = true;
      } catch (googleError) {
        // Google Calendar同期の失敗はメイン処理に影響させない
        console.error('Google Calendar自動同期エラー:', googleError);
      }
    }

    const syncedServices = [notionSynced && 'Notion', googleSynced && 'Google Calendar']
      .filter(Boolean)
      .join('・');

    return NextResponse.json({
      success: true,
      notion_synced: notionSynced,
      google_synced: googleSynced,
      message: syncedServices
        ? `マイルストーンを完了しました（${syncedServices}にも同期済み）`
        : 'マイルストーンを完了しました',
    });
  } catch (error) {
    console.error('マイルストーン完了エラー:', error);
    return NextResponse.json(
      { error: 'マイルストーンの完了処理に失敗しました' },
      { status: 500 }
    );
  }
}
