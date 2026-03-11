'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  BookOpen,
  Map,
  Trophy,
  Award,
  Settings,
  Menu,
  X,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/learning-plan', icon: Map, label: '学習プラン' },
  { href: '/lessons', icon: BookOpen, label: 'レッスン' },
  { href: '/progress', icon: Trophy, label: '進捗・統計' },
  { href: '/certificates', icon: Award, label: '証明書' },
  { href: '/settings', icon: Settings, label: '設定・連携' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const displayName = profile?.name || 'ユーザー';
  const initials = displayName.charAt(0).toUpperCase();
  const levelLabel = profile ? `Level ${profile.current_level}` : '';

  const handleSignOut = async () => {
    // サーバー側でセッション破棄→クライアント側クリア
    window.location.href = '/auth/logout';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* サイドバー */}
      <aside
        className={clsx(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-20',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* ロゴ */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Zap size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="font-black text-gray-800 whitespace-nowrap">PyReview Dojo</div>
                <div className="text-xs text-gray-400 whitespace-nowrap">Pythonマスターへの道</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                )}
              >
                <item.icon
                  size={20}
                  className={clsx('flex-shrink-0', isActive ? 'text-indigo-600' : '')}
                />
                {sidebarOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <ChevronRight size={16} className="ml-auto text-indigo-400" />
                )}
                {/* ツールチップ (collapsed時) */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ユーザーエリア */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                {initials}
              </div>
            )}
            {sidebarOpen && (
              <>
                <div className="overflow-hidden flex-1">
                  <div className="text-sm font-semibold text-gray-700 truncate">{displayName}</div>
                  <div className="text-xs text-gray-400">{levelLabel}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  title="ログアウト"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
