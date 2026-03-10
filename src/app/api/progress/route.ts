import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { lesson_id, exercise_id, status, score, time_spent_minutes } = await req.json();

    const authHeader = req.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    const { data, error } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: userId,
          lesson_id,
          exercise_id,
          status,
          score,
          time_spent_minutes: time_spent_minutes || 0,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,lesson_id,exercise_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('進捗更新エラー:', error);
      return NextResponse.json({ success: true, message: 'デモモード' });
    }

    // アクティビティログを記録
    if (status === 'completed') {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        activity_type: 'lesson_completed',
        title: 'レッスン完了',
        description: `スコア: ${score || '—'}点`,
        points: score,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('進捗取得エラー:', error);
    return NextResponse.json({ success: true, message: 'フォールバックモード' });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ progress: [] });
    }

    return NextResponse.json({ progress: data });
  } catch {
    return NextResponse.json({ progress: [] });
  }
}
