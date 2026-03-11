import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';

// プロフィール取得
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'プロフィールの取得に失敗しました' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// プロフィール更新
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const body = await request.json();
  const { name, avatar_url } = body;

  // バリデーション
  const updateData: Record<string, string> = {};
  if (typeof name === 'string' && name.trim().length > 0) {
    if (name.trim().length > 100) {
      return NextResponse.json({ error: '名前は100文字以内にしてください' }, { status: 400 });
    }
    updateData.name = name.trim();
  }
  if (typeof avatar_url === 'string') {
    updateData.avatar_url = avatar_url;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: '更新するデータがありません' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました' }, { status: 500 });
  }

  return NextResponse.json(data);
}
