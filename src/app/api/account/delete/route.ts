import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// アカウント削除
export async function DELETE() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'サーバー設定が不足しています' },
      { status: 500 }
    );
  }

  // 認証ユーザーの取得
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component では set 不可
        }
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  // サービスロールキーでadminクライアントを作成（ユーザー削除にはadmin権限が必要）
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // auth.usersを削除 → CASCADEでprofiles・全関連データが自動削除される
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('アカウント削除エラー:', error);
    return NextResponse.json(
      { error: 'アカウントの削除に失敗しました' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
