'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { LogOut } from 'lucide-react';

export default function AuthNavButtons() {
  const { supabaseUser, profile, loading, signOut } = useAuth();

  if (loading) {
    return <div className="w-24 h-8 bg-gray-100 rounded-xl animate-pulse" />;
  }

  if (supabaseUser) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
        >
          ダッシュボード
        </Link>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {(profile?.name || supabaseUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {profile?.name || supabaseUser.email?.split('@')[0]}
          </span>
        </div>
        <button
          onClick={() => {
            window.location.href = '/auth/logout';
          }}
          className="text-sm text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">ログアウト</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
      >
        ログイン
      </Link>
      <Link
        href="/auth/register"
        className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        無料で始める
      </Link>
    </div>
  );
}
