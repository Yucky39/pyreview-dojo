import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ソーシャルログイン・メール確認後のコールバック処理
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabaseResponse = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // セッション確立成功 → プロフィールの有無をチェック
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // ソーシャルログイン時のメタデータからプロフィールを同期
        const meta = user.user_metadata;
        if (meta) {
          const name = meta.full_name || meta.name || meta.user_name;
          const avatarUrl = meta.avatar_url || meta.picture || meta.profile_image_url;

          const updateData: Record<string, string> = {};
          if (name) updateData.name = name;
          if (avatarUrl) updateData.avatar_url = avatarUrl;

          if (Object.keys(updateData).length > 0) {
            // 既存プロフィールのnameが空またはメールアドレスの場合のみ名前を更新
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', user.id)
              .single();

            if (existingProfile) {
              const shouldUpdateName = !existingProfile.name || existingProfile.name === user.email;
              const shouldUpdateAvatar = !existingProfile.avatar_url && avatarUrl;

              const finalUpdate: Record<string, string> = {};
              if (shouldUpdateName && updateData.name) finalUpdate.name = updateData.name;
              if (shouldUpdateAvatar && updateData.avatar_url) finalUpdate.avatar_url = updateData.avatar_url;

              if (Object.keys(finalUpdate).length > 0) {
                await supabase
                  .from('profiles')
                  .update(finalUpdate)
                  .eq('id', user.id);
              }
            }
          }
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        // オンボーディング済みならダッシュボードへ
        if (profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/dashboard`, {
            headers: supabaseResponse.headers,
          });
        }
      }

      return supabaseResponse;
    }
  }

  // エラー時はログインページへ
  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
