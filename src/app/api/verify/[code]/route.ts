import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const { data: cert, error } = await supabase
      .from('certificates')
      .select('*, profiles(name)')
      .eq('verification_code', code)
      .single();

    if (error || !cert) {
      return NextResponse.json(
        { valid: false, error: '認証コードが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        id: cert.id,
        level: cert.level,
        title: cert.title,
        issued_at: cert.issued_at,
        verification_code: cert.verification_code,
        user_name: cert.profiles?.name || '不明',
      },
    });
  } catch (error) {
    console.error('証明書検証エラー:', error);
    return NextResponse.json(
      { valid: false, error: '検証中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
