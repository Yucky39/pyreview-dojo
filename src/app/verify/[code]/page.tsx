'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Award, Calendar, ShieldCheck } from 'lucide-react';
import { SkillLevel, SKILL_LEVEL_LABELS, SKILL_LEVEL_DESCRIPTIONS } from '@/types';
import LevelBadge from '@/components/ui/LevelBadge';

interface VerifyResult {
  valid: boolean;
  certificate?: {
    id: string;
    level: SkillLevel;
    title: string;
    issued_at: string;
    verification_code: string;
    user_name: string;
  };
  error?: string;
}

const DEMO_RESULT: VerifyResult = {
  valid: true,
  certificate: {
    id: 'cert-demo',
    level: 1,
    title: 'Python速習マスター',
    issued_at: '2026-03-05T10:00:00Z',
    verification_code: 'PRD-ABCD-EFGH-IJKL',
    user_name: 'ユーザー',
  },
};

const levelGradients: Record<SkillLevel, string> = {
  0: 'from-green-400 to-emerald-600',
  1: 'from-blue-400 to-blue-600',
  2: 'from-yellow-400 to-amber-600',
  3: 'from-orange-400 to-red-500',
  4: 'from-purple-400 to-purple-700',
  5: 'from-pink-400 to-rose-600',
};

export default function VerifyPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/verify/${code}`);
        const data = await res.json();
        setResult(data);
      } catch {
        // デモ用: コードが一致する場合はデモデータを返す
        if (code === 'PRD-ABCD-EFGH-IJKL') {
          setResult(DEMO_RESULT);
        } else {
          setResult({ valid: false, error: '認証コードが無効です' });
        }
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-indigo-100 mb-4">
            <ShieldCheck size={18} className="text-indigo-500" />
            <span className="font-bold text-indigo-700">PyReview Dojo 証明書認証</span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500">認証コードを確認中...</p>
          </div>
        ) : result?.valid && result.certificate ? (
          <div className="space-y-4">
            {/* 有効バッジ */}
            <div className="flex items-center justify-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-2xl border border-green-200">
              <CheckCircle2 size={24} />
              <span className="font-bold text-lg">認証済み - 有効な証明書</span>
            </div>

            {/* 証明書カード */}
            <div
              className={`bg-gradient-to-br ${levelGradients[result.certificate.level]} rounded-3xl p-8 text-center shadow-xl`}
            >
              <div className="bg-white/15 backdrop-blur rounded-2xl p-6">
                <div className="text-white/80 text-sm font-medium mb-1">PyReview Dojo</div>
                <div className="text-white font-black text-2xl mb-4">習熟レベル認定証</div>

                <div className="bg-white/20 rounded-full w-20 h-20 flex flex-col items-center justify-center mx-auto mb-4">
                  <div className="text-white text-xs font-semibold">Level</div>
                  <div className="text-white font-black text-4xl leading-none">
                    {result.certificate.level}
                  </div>
                </div>

                <div className="text-white font-bold text-xl mb-1">
                  {SKILL_LEVEL_LABELS[result.certificate.level]}
                </div>
                <div className="text-white/80 text-sm mb-4">
                  {SKILL_LEVEL_DESCRIPTIONS[result.certificate.level]}
                </div>

                <div className="text-white/60 text-xs mb-1">認定者</div>
                <div className="text-white font-bold text-2xl mb-4">
                  {result.certificate.user_name} 様
                </div>

                <div className="text-white font-semibold text-sm mb-4">
                  {result.certificate.title}
                </div>

                <div className="border-t border-white/30 pt-4 flex justify-between text-white/70 text-xs">
                  <span>
                    発行日:{' '}
                    {new Date(result.certificate.issued_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-mono text-xs">{result.certificate.verification_code}</span>
                </div>
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Award size={18} className="text-indigo-500" />
                認証詳細
              </h3>
              <div className="space-y-2">
                <InfoRow label="認証者氏名" value={result.certificate.user_name} />
                <InfoRow label="取得レベル" value={`Level ${result.certificate.level} - ${SKILL_LEVEL_LABELS[result.certificate.level]}`} />
                <InfoRow label="証明書タイトル" value={result.certificate.title} />
                <InfoRow
                  label="発行日"
                  value={new Date(result.certificate.issued_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
                <InfoRow label="認証コード" value={result.certificate.verification_code} mono />
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              この証明書は PyReview Dojo によって発行されました。
              <br />
              認証コードで真正性を確認できます。
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">無効な証明書</h2>
            <p className="text-gray-500 text-sm mb-4">
              {result?.error || '認証コードが見つかりませんでした。コードを確認してください。'}
            </p>
            <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2">
              確認コード: {code}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold text-gray-800 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
