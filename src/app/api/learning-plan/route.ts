import { NextResponse } from 'next/server';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: plan, error } = await supabase
      .from('learning_plans')
      .select(`
        id,
        title,
        description,
        start_date,
        end_date,
        total_weeks,
        status,
        learning_phases(
          id,
          phase_number,
          title,
          description,
          weeks,
          start_date,
          end_date,
          target_level,
          status,
          milestones(
            id,
            title,
            description,
            due_date,
            status
          ),
          phase_lessons(
            id,
            lesson_id,
            title,
            status,
            estimated_minutes,
            order_index
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .single();

    if (error || !plan) {
      return NextResponse.json({ error: '学習プランが見つかりません' }, { status: 404 });
    }

    // phase_lessons を lessons にリネームして返す
    const formatted = {
      ...plan,
      phases: (plan.learning_phases ?? [])
        .sort((a: { phase_number: number }, b: { phase_number: number }) => a.phase_number - b.phase_number)
        .map((phase: {
          phase_lessons?: { lesson_id: string; order_index: number }[];
          milestones?: unknown[];
          [key: string]: unknown;
        }) => ({
          ...phase,
          lessons: (phase.phase_lessons ?? [])
            .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index),
          milestones: phase.milestones ?? [],
          phase_lessons: undefined,
        })),
      learning_phases: undefined,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('学習プラン取得エラー:', error);
    return NextResponse.json({ error: '学習プランの取得に失敗しました' }, { status: 500 });
  }
}
