import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// サーバーサイドでセッションを破棄してからトップページにリダイレクト
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const redirectResponse = NextResponse.redirect(`${origin}/auth/login`);

  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co') {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    await supabase.auth.signOut();
  }

  return redirectResponse;
}
