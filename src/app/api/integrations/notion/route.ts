import { NextRequest, NextResponse } from 'next/server';
import { syncMilestonesToNotion, createPlanOverviewPage, updateMilestoneInNotion } from '@/lib/notion';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
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

    // Notionに同期
    for (const phase of plan.learning_phases) {
      if (phase.milestones && profile.notion_database_id) {
        await syncMilestonesToNotion(
          profile.notion_token,
          profile.notion_database_id,
          phase.milestones,
          phase.phase_number
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Notionに同期しました' });
  } catch (error) {
    console.error('Notion同期エラー:', error);
    return NextResponse.json(
      { error: 'Notionとの同期に失敗しました' },
      { status: 500 }
    );
  }
}
