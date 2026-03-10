import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: cert, error } = await supabase
      .from('certificates')
      .select('*, profiles(name)')
      .eq('id', id)
      .single();

    if (error || !cert) {
      return NextResponse.json({ error: '証明書が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ certificate: cert });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
