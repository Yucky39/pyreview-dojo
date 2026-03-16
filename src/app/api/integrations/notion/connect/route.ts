import { NextRequest, NextResponse } from 'next/server';
import { createNotionClient, createNotionLearningDatabase, createPlanOverviewPage } from '@/lib/notion';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { token, page_id } = await req.json();

    if (!token || !page_id) {
      return NextResponse.json({ error: 'tokenとpage_idが必要です' }, { status: 400 });
    }

    // Notionクライアントのテスト
    const notion = createNotionClient(token);
    try {
      await notion.pages.retrieve({ page_id });
    } catch {
      return NextResponse.json({ error: 'Notionの認証に失敗しました。トークンとページIDを確認してください' }, { status: 401 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const userId = user.id;

    // ユーザーの学習プランを取得
    const { data: plan } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    let databaseId = '';
    if (plan) {
      // Notionにデータベースを作成
      databaseId = await createNotionLearningDatabase(token, page_id, plan);
      // 概要ページも作成
      await createPlanOverviewPage(token, page_id, plan);
    }

    // プロフィールを更新
    await supabase
      .from('profiles')
      .update({
        notion_token: token,
        notion_database_id: databaseId,
      })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      database_id: databaseId,
      message: 'Notionと連携しました',
    });
  } catch (error) {
    console.error('Notion連携エラー:', error);
    return NextResponse.json({ error: '連携に失敗しました' }, { status: 500 });
  }
}
