import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';

// アバター画像アップロード
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
  }

  // ファイルサイズチェック (2MB)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'ファイルサイズは2MB以内にしてください' }, { status: 400 });
  }

  // MIMEタイプチェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'JPEG, PNG, WebP, GIF のいずれかの画像を選択してください' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // ファイル名を生成
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `avatars/${user.id}.${ext}`;

  // Supabase Storage にアップロード
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    // Storage バケットが存在しない場合はURLベースのアバターのみサポート
    return NextResponse.json(
      { error: 'アバターのアップロードに失敗しました。Supabase Storage の avatars バケットを確認してください' },
      { status: 500 }
    );
  }

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  // プロフィールを更新
  const { data, error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました' }, { status: 500 });
  }

  return NextResponse.json(data);
}
