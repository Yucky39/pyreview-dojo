import { Certificate, SkillLevel, SKILL_LEVEL_LABELS } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { nanoid } from 'nanoid';

// ===== 認証コード生成 =====

export function generateVerificationCode(): string {
  return `PRD-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
}

// ===== 証明書SVGの生成 =====

export function generateCertificateSVG(
  certificate: Certificate,
  userName: string
): string {
  const levelLabel = SKILL_LEVEL_LABELS[certificate.level];
  const issuedDate = format(new Date(certificate.issued_at), 'yyyy年M月d日', { locale: ja });

  const levelColors: Record<SkillLevel, { bg: string; accent: string }> = {
    0: { bg: '#E8F5E9', accent: '#4CAF50' },
    1: { bg: '#E3F2FD', accent: '#2196F3' },
    2: { bg: '#FFF8E1', accent: '#FFC107' },
    3: { bg: '#FBE9E7', accent: '#FF5722' },
    4: { bg: '#F3E5F5', accent: '#9C27B0' },
    5: { bg: '#FCE4EC', accent: '#E91E63' },
  };

  const colors = levelColors[certificate.level];

  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans JP', 'Hiragino Sans', sans-serif">
  <!-- 背景 -->
  <rect width="800" height="600" fill="${colors.bg}" rx="16"/>

  <!-- ボーダー装飾 -->
  <rect x="16" y="16" width="768" height="568" fill="none" stroke="${colors.accent}" stroke-width="3" rx="12"/>
  <rect x="24" y="24" width="752" height="552" fill="none" stroke="${colors.accent}" stroke-width="1" rx="10" stroke-dasharray="8 4"/>

  <!-- ヘッダー -->
  <rect x="16" y="16" width="768" height="100" fill="${colors.accent}" rx="12"/>
  <rect x="16" y="92" width="768" height="24" fill="${colors.accent}"/>

  <!-- ロゴエリア -->
  <text x="400" y="60" font-size="24" font-weight="bold" fill="white" text-anchor="middle">PyReview Dojo</text>
  <text x="400" y="88" font-size="14" fill="rgba(255,255,255,0.9)" text-anchor="middle">Python コードレビュー学習プラットフォーム</text>

  <!-- 証明書タイトル -->
  <text x="400" y="170" font-size="32" font-weight="bold" fill="${colors.accent}" text-anchor="middle">習熟レベル認定証</text>

  <!-- 装飾ライン -->
  <line x1="120" y1="190" x2="680" y2="190" stroke="${colors.accent}" stroke-width="2"/>

  <!-- レベルバッジ -->
  <circle cx="400" cy="260" r="60" fill="${colors.accent}" opacity="0.15"/>
  <circle cx="400" cy="260" r="50" fill="none" stroke="${colors.accent}" stroke-width="3"/>
  <text x="400" y="250" font-size="18" font-weight="bold" fill="${colors.accent}" text-anchor="middle">Level</text>
  <text x="400" y="285" font-size="36" font-weight="bold" fill="${colors.accent}" text-anchor="middle">${certificate.level}</text>

  <!-- レベル名 -->
  <text x="400" y="345" font-size="22" font-weight="bold" fill="#333" text-anchor="middle">${levelLabel}</text>

  <!-- ユーザー名 -->
  <text x="400" y="400" font-size="16" fill="#666" text-anchor="middle">以下の方に認定します</text>
  <text x="400" y="440" font-size="28" font-weight="bold" fill="#222" text-anchor="middle">${userName}</text>

  <!-- 装飾ライン -->
  <line x1="200" y1="455" x2="600" y2="455" stroke="#ccc" stroke-width="1"/>

  <!-- 証明書タイトル -->
  <text x="400" y="490" font-size="16" fill="#555" text-anchor="middle">${certificate.title}</text>

  <!-- フッター情報 -->
  <text x="150" y="545" font-size="12" fill="#888" text-anchor="middle">発行日: ${issuedDate}</text>
  <text x="400" y="545" font-size="10" fill="#aaa" text-anchor="middle">認証コード: ${certificate.verification_code}</text>
  <text x="650" y="545" font-size="12" fill="#888" text-anchor="middle">PyReview Dojo</text>
</svg>`;
}

// ===== HTML証明書テンプレート (印刷用) =====

export function generateCertificateHTML(
  certificate: Certificate,
  userName: string
): string {
  const levelLabel = SKILL_LEVEL_LABELS[certificate.level];
  const issuedDate = format(new Date(certificate.issued_at), 'yyyy年M月d日', { locale: ja });

  const levelGradients: Record<SkillLevel, string> = {
    0: 'from-green-400 to-emerald-600',
    1: 'from-blue-400 to-blue-600',
    2: 'from-yellow-400 to-amber-600',
    3: 'from-orange-400 to-red-500',
    4: 'from-purple-400 to-purple-600',
    5: 'from-pink-400 to-rose-600',
  };

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>PyReview Dojo - 習熟レベル認定証 Level ${certificate.level}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
  body { font-family: 'Noto Sans JP', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
  .certificate { width: 800px; height: 600px; margin: 0 auto; position: relative; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 28px; font-weight: 900; }
  .header p { margin: 4px 0 0; font-size: 14px; opacity: 0.9; }
  .body { padding: 40px 60px; text-align: center; }
  .level-badge { display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 4px solid #6366f1; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 20px; background: rgba(99,102,241,0.1); }
  .level-number { font-size: 48px; font-weight: 900; color: #6366f1; line-height: 1; }
  .level-text { font-size: 12px; color: #6366f1; font-weight: 700; }
  .level-name { font-size: 24px; font-weight: 700; color: #333; margin: 0 0 16px; }
  .recipient { font-size: 14px; color: #666; margin: 0; }
  .name { font-size: 32px; font-weight: 900; color: #111; margin: 8px 0 16px; }
  .title { font-size: 16px; color: #555; margin: 0 0 24px; }
  .footer { border-top: 1px solid #eee; padding: 16px 60px; display: flex; justify-content: space-between; font-size: 12px; color: #999; }
  .verification { font-family: monospace; font-size: 11px; }
</style>
</head>
<body>
<div class="certificate">
  <div class="header">
    <h1>PyReview Dojo</h1>
    <p>Python コードレビュー学習プラットフォーム</p>
  </div>
  <div class="body">
    <h2 style="font-size:20px;color:#6366f1;margin:0 0 20px;letter-spacing:0.1em">習熟レベル認定証</h2>
    <div class="level-badge">
      <span class="level-number">${certificate.level}</span>
      <span class="level-text">Level</span>
    </div>
    <div class="level-name">${levelLabel}</div>
    <p class="recipient">以下の方のレベルを認定します</p>
    <div class="name">${userName}</div>
    <p class="title">${certificate.title}</p>
  </div>
  <div class="footer">
    <span>発行日: ${issuedDate}</span>
    <span class="verification">認証コード: ${certificate.verification_code}</span>
    <span>PyReview Dojo</span>
  </div>
</div>
</body>
</html>`;
}
