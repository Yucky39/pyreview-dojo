import { NextRequest, NextResponse } from 'next/server';
import { generateCertificateHTML } from '@/lib/certificate';
import { SkillLevel } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const certData = {
      id,
      level: 1 as SkillLevel,
      title: 'Python速習マスター',
      issued_at: new Date().toISOString(),
      verification_code: 'PRD-ABCD-EFGH-IJKL',
      user_id: 'demo-user',
      milestone_id: null,
    };

    const html = generateCertificateHTML(certData, 'ユーザー');

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="certificate-level${certData.level}.html"`,
      },
    });
  } catch (error) {
    console.error('証明書ダウンロードエラー:', error);
    return NextResponse.json({ error: 'ダウンロードに失敗しました' }, { status: 500 });
  }
}
