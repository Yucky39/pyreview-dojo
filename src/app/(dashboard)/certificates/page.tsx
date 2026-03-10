'use client';

import { useState } from 'react';
import {
  Award,
  Download,
  ExternalLink,
  Share2,
  CheckCircle2,
  Lock,
  Calendar,
} from 'lucide-react';
import { clsx } from 'clsx';
import { SkillLevel, SKILL_LEVEL_LABELS, SKILL_LEVEL_DESCRIPTIONS } from '@/types';
import LevelBadge from '@/components/ui/LevelBadge';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const DEMO_CERTIFICATES = [
  {
    id: 'cert-1',
    level: 1 as SkillLevel,
    title: 'Python速習マスター',
    issued_at: '2026-03-05T10:00:00Z',
    verification_code: 'PRD-ABCD-EFGH-IJKL',
    earned: true,
    milestone_title: 'Python基礎文法マスター',
  },
];

const ALL_LEVELS: SkillLevel[] = [0, 1, 2, 3, 4, 5];

const levelCertTitles: Record<SkillLevel, string> = {
  0: 'プログラミング入門修了',
  1: 'Python速習マスター',
  2: 'Python基礎習得認定',
  3: 'Python実践開発者',
  4: 'Pythonアプリ開発者',
  5: 'Pythonコードレビュアー',
};

const levelGradients: Record<SkillLevel, string> = {
  0: 'from-green-400 to-emerald-600',
  1: 'from-blue-400 to-blue-600',
  2: 'from-yellow-400 to-amber-600',
  3: 'from-orange-400 to-red-500',
  4: 'from-purple-400 to-purple-700',
  5: 'from-pink-400 to-rose-600',
};

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState(DEMO_CERTIFICATES[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const earnedLevels = new Set(DEMO_CERTIFICATES.map((c) => c.level));

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/certificates/${selectedCert.id}/download`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-level${selectedCert.level}.pdf`;
      a.click();
      toast.success('証明書をダウンロードしました');
    } catch {
      toast.error('ダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedCert.verification_code);
    setCopiedCode(true);
    toast.success('認証コードをコピーしました');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareVerify = () => {
    const url = `${window.location.origin}/verify/${selectedCert.verification_code}`;
    navigator.clipboard.writeText(url);
    toast.success('認証URLをコピーしました！チームメンバーや上司に共有できます');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">習熟レベル認定証</h1>
        <p className="text-gray-500 mt-1">
          各レベルの達成時に発行される証明書です。管理者は認証コードでレベルを確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 証明書一覧 */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">レベル一覧</h2>

          {ALL_LEVELS.map((level) => {
            const isEarned = earnedLevels.has(level);
            const cert = DEMO_CERTIFICATES.find((c) => c.level === level);

            return (
              <button
                key={level}
                onClick={() => cert && setSelectedCert(cert)}
                disabled={!isEarned}
                className={clsx(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                  isEarned
                    ? selectedCert?.level === level
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                )}
              >
                <LevelBadge level={level} size="sm" showLabel={false} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800">
                    {levelCertTitles[level]}
                  </div>
                  <div className="text-xs text-gray-400">Level {level} · {SKILL_LEVEL_LABELS[level]}</div>
                </div>
                {isEarned ? (
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Lock size={16} className="text-gray-300 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 証明書プレビュー */}
        <div className="lg:col-span-2">
          {selectedCert ? (
            <div className="space-y-4">
              {/* 証明書カード */}
              <div
                className={clsx(
                  'rounded-3xl p-8 text-center shadow-xl bg-gradient-to-br',
                  levelGradients[selectedCert.level]
                )}
              >
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <div className="text-white/80 text-sm font-medium mb-1">PyReview Dojo</div>
                  <div className="text-white/90 text-xs mb-4">Python コードレビュー学習プラットフォーム</div>

                  <div className="text-white font-black text-2xl mb-4">習熟レベル認定証</div>

                  <div className="bg-white/20 rounded-full w-24 h-24 flex flex-col items-center justify-center mx-auto mb-4">
                    <div className="text-white text-xs font-semibold">Level</div>
                    <div className="text-white font-black text-5xl leading-none">{selectedCert.level}</div>
                  </div>

                  <div className="text-white font-bold text-xl mb-1">
                    {SKILL_LEVEL_LABELS[selectedCert.level]}
                  </div>
                  <div className="text-white/80 text-sm mb-4">
                    {SKILL_LEVEL_DESCRIPTIONS[selectedCert.level]}
                  </div>

                  <div className="text-white/60 text-xs mb-1">以下の方のレベルを認定します</div>
                  <div className="text-white font-bold text-2xl mb-4">ユーザー 様</div>

                  <div className="text-white font-semibold text-sm mb-4">{selectedCert.title}</div>

                  <div className="border-t border-white/30 pt-4 flex justify-between text-white/70 text-xs">
                    <span>
                      発行日:{' '}
                      {new Date(selectedCert.issued_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-mono text-xs">{selectedCert.verification_code}</span>
                  </div>
                </div>
              </div>

              {/* アクション */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  loading={isDownloading}
                  fullWidth
                >
                  <Download size={16} />
                  PDF保存
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareVerify}
                  fullWidth
                >
                  <Share2 size={16} />
                  認証URL共有
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  fullWidth
                >
                  {copiedCode ? <CheckCircle2 size={16} /> : <ExternalLink size={16} />}
                  {copiedCode ? 'コピー済み' : '認証コード'}
                </Button>
              </div>

              {/* 認証情報 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                  <Award size={16} className="text-indigo-500" />
                  証明書情報（管理者向け）
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">認証コード</span>
                    <span className="font-mono font-semibold text-gray-800">{selectedCert.verification_code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">達成マイルストーン</span>
                    <span className="text-gray-800">{selectedCert.milestone_title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">発行日</span>
                    <span className="text-gray-800 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedCert.issued_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">
                    管理者は以下のURLでレベルを確認できます:
                  </p>
                  <p className="text-xs font-mono text-indigo-600 break-all mt-1">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'}/verify/{selectedCert.verification_code}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <Award size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">証明書を選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
