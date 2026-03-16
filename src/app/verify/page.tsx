'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Search, AlertCircle, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

// PRD-XXXX-XXXX-XXXX 形式のバリデーション
function isValidCodeFormat(code: string): boolean {
  return /^PRD-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.toUpperCase());
}

function formatCode(value: string): string {
  // 入力を大文字化してフォーマット
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const parts: string[] = [];
  if (clean.length > 0) parts.push('PRD');
  if (clean.length > 0) parts.push(clean.slice(0, 4));
  if (clean.length > 4) parts.push(clean.slice(4, 8));
  if (clean.length > 8) parts.push(clean.slice(8, 12));
  return parts.join('-');
}

export default function VerifyIndexPage() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // PRD- プレフィックスを除いた部分をフォーマット
    const withoutPrefix = raw.startsWith('PRD-') ? raw.slice(4) : raw;
    const formatted = formatCode(withoutPrefix);
    setInputCode(formatted);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.trim();

    if (!code) {
      setError('認証コードを入力してください');
      return;
    }
    if (!isValidCodeFormat(code)) {
      setError('認証コードの形式が正しくありません（例: PRD-ABCD-EFGH-IJKL）');
      return;
    }

    router.push(`/verify/${encodeURIComponent(code)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-gray-800">PyReview Dojo</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-indigo-100">
            <ShieldCheck size={18} className="text-indigo-500" />
            <span className="font-bold text-indigo-700">証明書の真正性を確認</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-black text-gray-800 mb-2">証明書を検証する</h1>
          <p className="text-gray-500 text-sm mb-6">
            PyReview Dojo が発行した習熟レベル認定証の認証コードを入力してください。
            証明書の真正性をリアルタイムで確認できます。
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                認証コード
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="code"
                  type="text"
                  value={inputCode}
                  onChange={handleInputChange}
                  placeholder="PRD-XXXX-XXXX-XXXX"
                  maxLength={19}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-mono tracking-widest uppercase"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                証明書に記載された PRD-XXXX-XXXX-XXXX 形式のコードを入力
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!inputCode}
            >
              <ShieldCheck size={18} />
              証明書を確認する
            </Button>
          </form>

          {/* 使い方の説明 */}
          <div className="mt-6 bg-indigo-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-indigo-800 mb-2">認証コードの確認方法</h3>
            <ul className="text-xs text-indigo-700 space-y-1.5 list-none">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">①</span>
                証明書に印字された認証コードを確認します
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">②</span>
                上のフォームにコードを入力して「証明書を確認する」をクリック
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">③</span>
                認定者の氏名・レベル・発行日が表示されます
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          PyReview Dojo の証明書は認証コードで真正性を確認できます。
          <br />
          採用担当者・管理者向けの公開検証ページです。
        </p>
      </div>
    </div>
  );
}
