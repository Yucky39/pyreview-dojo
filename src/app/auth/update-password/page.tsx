'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Zap, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['', '弱い', '普通', '強い', '非常に強い'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= strength ? colors[strength] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">
        強度: <span className="font-medium text-gray-600">{labels[strength]}</span>
      </p>
    </div>
  );
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // セッションが有効かどうか確認
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // セッションがない場合はリセット申請ページへ
        router.replace('/auth/reset-password?error=session_expired');
        return;
      }
      setSessionReady(true);
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        if (updateError.message.includes('same password')) {
          setError('現在のパスワードと同じパスワードは設定できません');
        } else {
          setError('パスワードの更新に失敗しました。再度お試しください。');
        }
        return;
      }

      setSuccess(true);
      // 3秒後にダッシュボードへ
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch {
      setError('更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

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
          {success ? (
            /* 更新完了画面 */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                パスワードを更新しました
              </h1>
              <p className="text-sm text-gray-500 mb-2">
                新しいパスワードが設定されました。
              </p>
              <p className="text-xs text-gray-400">
                まもなくダッシュボードに移動します...
              </p>
            </div>
          ) : (
            /* パスワード入力フォーム */
            <>
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                新しいパスワードの設定
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                新しいパスワードを入力してください。
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle
                    size={18}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 新しいパスワード */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8文字以上"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                {/* パスワード確認 */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    パスワード（確認）
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="パスワードを再入力"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      パスワードが一致しません
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> 一致しています
                    </p>
                  )}
                </div>

                {/* パスワード要件 */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  {[
                    { label: '8文字以上', met: password.length >= 8 },
                    { label: '大文字を含む', met: /[A-Z]/.test(password) },
                    { label: '小文字を含む', met: /[a-z]/.test(password) },
                    { label: '数字を含む', met: /[0-9]/.test(password) },
                  ].map(({ label, met }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 text-xs ${
                        met ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      <CheckCircle2
                        size={12}
                        className={met ? 'text-green-500' : 'text-gray-300'}
                      />
                      {label}
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  size="lg"
                  disabled={
                    password !== confirmPassword ||
                    password.length < 8
                  }
                >
                  パスワードを更新する
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
