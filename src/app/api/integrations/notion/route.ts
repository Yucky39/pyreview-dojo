import { NextResponse } from 'next/server';
import { syncMilestonesToNotion } from '@/lib/notion';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase-server';
import { decrypt } from '@/lib/encryption';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const userId = user.id;

    // ユーザーのNotion設定を取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('notion_token, notion_database_id')
      .eq('id', userId)
      .single();

    if (!profile?.notion_token) {
      return NextResponse.json(
        { error: 'Notion連携が設定されていません' },
        { status: 400 }
      );
    }

    // 暗号化されたトークンを復号
    const notionToken = decrypt(profile.notion_token);

    // 学習プランとマイルストーンを取得
    const { data: plan } = await supabase
      .from('learning_plans')
      .select(`
        *,
        learning_phases(
          *,
          milestones(*)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!plan) {
      return NextResponse.json({ error: '学習プランが見つかりません' }, { status: 404 });
    }

    // 「進行中」として扱う最初のpendingマイルストーンを特定
    let currentMilestoneId: string | undefined;
    for (const phase of plan.learning_phases) {
      if (phase.milestones) {
        const sortedPhase = [...phase.milestones].sort(
          (a: { due_date: string }, b: { due_date: string }) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        const firstPending = sortedPhase.find(
          (m: { status: string }) => m.status === 'pending'
        );
        if (firstPending) {
          currentMilestoneId = firstPending.id;
          break;
        }
      }
    }

    // Notionに同期（upsert）
    let syncedCount = 0;
    for (const phase of plan.learning_phases) {
      if (phase.milestones && profile.notion_database_id) {
        await syncMilestonesToNotion(
          notionToken,
          profile.notion_database_id,
          phase.milestones,
          phase.phase_number,
          currentMilestoneId
        );
        syncedCount += phase.milestones.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notionに同期しました（${syncedCount}件）`,
      synced_count: syncedCount,
    });
  } catch (error) {
    console.error('Notion同期エラー:', error);
    return NextResponse.json(
      { error: 'Notionとの同期に失敗しました' },
      { status: 500 }
    );
  }
}
