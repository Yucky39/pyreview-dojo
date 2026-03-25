'use client';

import { useState, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const displayName = profile?.name || 'ユーザー';
  const initials = displayName.charAt(0).toUpperCase();
  const levelLabel = profile ? `Level ${profile.current_level}` : '';

  // 画面サイズがデスクトップになったらモバイルメニューを閉じる
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    window.location.href = '/auth/logout';
  };

  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">

      {/* === モバイル専用トップバー === */}
      <header className="md:hidden flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          aria-label="メニューを開く"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-black text-gray-800 text-sm">PyReview Dojo</span>
        </div>
        {/* 右スペーサー（ロゴを視覚的に中央に寄せる） */}
        <div className="w-9" />
      </header>

      {/* === モバイル用オーバーレイ背景 === */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* === サイドバー === */}
      <aside
        className={clsx(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50',
          // モバイル: fixed でスライドイン／アウト
          'fixed inset-y-0 left-0',
          // デスクトップ: static で通常フロー
          'md:static md:inset-auto',
          // モバイルのスライド制御
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
          // 幅: モバイルは280px固定、デスクトップはsidebarOpenに従う
          'w-[280px]',
          sidebarOpen ? 'md:w-64' : 'md:w-16',
        )}
      >
        {/* ロゴ */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Zap size={16} className="text-white" />
            </div>
            {/* モバイルは常時表示、デスクトップはsidebarOpenに従う */}
            <div className={clsx('overflow-hidden', !sidebarOpen && 'md:hidden')}>
              <div className="font-black text-gray-800 whitespace-nowrap">PyReview Dojo</div>
              <div className="text-xs text-gray-400 whitespace-nowrap">Pythonマスターへの道</div>
            </div>
          </div>
          <button
            onClick={handleSidebarToggle}
            className="ml-auto text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
          >
            {/* モバイル: 常に × を表示 */}
            <X size={18} className="md:hidden" />
            {/* デスクトップ: sidebarOpenに従って切り替え */}
            <span className="hidden md:block">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </span>
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                {/* モバイルは常時表示、デスクトップはsidebarOpenに従う */}
                <span className={clsx('font-medium text-sm whitespace-nowrap', !sidebarOpen && 'md:hidden')}>
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight size={16} className={clsx('ml-auto text-indigo-400', !sidebarOpen && 'md:hidden')} />
                )}
                {/* ツールチップ: デスクトップ collapsed 時のみ */}
                {!sidebarOpen && (
                  <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
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
            {/* モバイルは常時表示、デスクトップはsidebarOpenに従う */}
            <div className={clsx('overflow-hidden flex-1', !sidebarOpen && 'md:hidden')}>
              <div className="text-sm font-semibold text-gray-700 truncate">{displayName}</div>
              <div className="text-xs text-gray-400">{levelLabel}</div>
            </div>
            <button
              onClick={handleSignOut}
              className={clsx(
                'text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors',
                !sidebarOpen && 'md:hidden'
              )}
              title="ログアウト"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
