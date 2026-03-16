import { NextResponse } from 'next/server';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // プロフィール・レベル情報
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_level, streak_days, total_study_minutes')
      .eq('id', user.id)
      .single();

    // 学習進捗
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id, status, score')
      .eq('user_id', user.id);

    // 証明書
    const { data: certificates } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id);

    // 学習プラン（マイルストーン含む）
    const { data: plan } = await supabase
      .from('learning_plans')
      .select(`
        id,
        learning_phases(
          milestones(id, title, description, due_date, status)
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // 最近のアクティビティ
    const { data: activities } = await supabase
      .from('activity_logs')
      .select('id, activity_type, title, description, points, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const completedLessons = progress?.filter((p) => p.status === 'completed').length ?? 0;
    const totalLessons = 22; // 全レッスン数（固定値）
    const milestones = plan?.learning_phases?.flatMap((ph: { milestones: unknown[] }) => ph.milestones) ?? [];
    const completedMilestones = milestones.filter((m: { status: string }) => m.status === 'completed').length;
    const nextMilestone = milestones.find((m: { status: string }) => m.status !== 'completed') ?? null;

    const stats = {
      current_level: profile?.current_level ?? 0,
      completion_percentage: Math.round((completedLessons / totalLessons) * 100),
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      completed_milestones: completedMilestones,
      total_milestones: milestones.length || 6,
      current_streak_days: profile?.streak_days ?? 0,
      total_study_hours: Math.round((profile?.total_study_minutes ?? 0) / 60),
      certificates_earned: certificates?.length ?? 0,
      next_milestone: nextMilestone,
      recent_activity: (activities ?? []).map((a) => ({
        ...a,
        user_id: user.id,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('ダッシュボード統計取得エラー:', error);
    return NextResponse.json({ error: '統計の取得に失敗しました' }, { status: 500 });
  }
}
