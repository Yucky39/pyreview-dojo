'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Zap, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // パスワード更新ページへのリダイレクトURLを生成
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/auth/update-password`
          : '/auth/callback?next=/auth/update-password';

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (resetError) {
        setError('メール送信中にエラーが発生しました。しばらく経ってから再度お試しください。');
        return;
      }

      setSent(true);
    } catch {
      setError('送信中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">PyReview Dojo</div>
              <div className="text-xs text-gray-400">Python マスターへの道</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
          {sent ? (
            /* 送信完了画面 */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">メールを送信しました</h1>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-gray-700">{email}</span> にパスワードリセット用のリンクを送信しました。
                メールをご確認ください。
              </p>
              <p className="text-xs text-gray-400 mb-6">
                メールが届かない場合は迷惑メールフォルダをご確認ください。
                数分経っても届かない場合は再度お試しください。
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
              >
                別のメールアドレスで再送信
              </Button>
            </div>
          ) : (
            /* メール入力フォーム */
            <>
              <h1 className="text-xl font-bold text-gray-800 mb-1">パスワードのリセット</h1>
              <p className="text-sm text-gray-500 mb-6">
                登録済みのメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
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
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    メールアドレス
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg">
                  リセットメールを送信
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            <ArrowLeft size={14} />
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
