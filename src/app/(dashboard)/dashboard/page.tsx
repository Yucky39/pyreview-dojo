'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Trophy,
  Flame,
  Clock,
  Award,
  ChevronRight,
  Star,
  Target,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { DashboardStats, ActivityLog } from '@/types';
import LevelBadge, { LevelProgress } from '@/components/ui/LevelBadge';
import ProgressCard from '@/components/ui/ProgressCard';
import Button from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// デモ用のスタッツ
const DEMO_STATS: DashboardStats = {
  current_level: 1,
  completion_percentage: 23,
  completed_lessons: 5,
  total_lessons: 22,
  completed_milestones: 1,
  total_milestones: 6,
  current_streak_days: 4,
  total_study_hours: 12,
  certificates_earned: 1,
  next_milestone: {
    id: 'ms-1',
    phase_id: 'ph-1',
    title: 'Python基礎文法マスター',
    description: '変数、制御構造、関数の基礎を習得',
    due_date: '2026-03-24',
    status: 'pending',
  },
  recent_activity: [
    {
      id: 'a1',
      user_id: 'u1',
      activity_type: 'lesson_completed',
      title: 'Python変数とデータ型',
      description: 'レッスンを完了しました',
      points: 50,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'a2',
      user_id: 'u1',
      activity_type: 'exercise_submitted',
      title: 'リスト操作演習',
      description: 'スコア: 85点',
      points: 85,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'a3',
      user_id: 'u1',
      activity_type: 'certificate_issued',
      title: 'Python入門レベル認定',
      description: 'Level 1 証明書が発行されました',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
};

const activityIcons: Record<ActivityLog['activity_type'], { icon: React.ReactNode; color: string }> = {
  lesson_completed: { icon: <BookOpen size={16} />, color: 'bg-blue-100 text-blue-600' },
  exercise_submitted: { icon: <Star size={16} />, color: 'bg-yellow-100 text-yellow-600' },
  milestone_achieved: { icon: <Trophy size={16} />, color: 'bg-purple-100 text-purple-600' },
  level_up: { icon: <TrendingUp size={16} />, color: 'bg-green-100 text-green-600' },
  certificate_issued: { icon: <Award size={16} />, color: 'bg-pink-100 text-pink-600' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('おはようございます');
    else if (hour < 18) setGreeting('こんにちは');
    else setGreeting('こんばんは');
  }, []);

  return (
    <div className="space-y-6">
      {/* ウェルカムヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{greeting}！</p>
            <h1 className="text-2xl font-black mt-1">今日も一緒に頑張りましょう 🐍</h1>
            <p className="text-indigo-200 text-sm mt-2">
              連続学習 <span className="text-white font-bold">{stats.current_streak_days}日</span> 達成中！
            </p>
          </div>
          <div className="text-right">
            <LevelBadge level={stats.current_level} size="lg" showLabel={false} />
          </div>
        </div>

        <div className="mt-5">
          <LevelProgress currentLevel={stats.current_level} />
        </div>

        <div className="mt-4 flex gap-3">
          <Link href="/lessons">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-0 text-white">
              <BookOpen size={16} />
              レッスンを続ける
            </Button>
          </Link>
          <Link href="/learning-plan">
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-0 text-white">
              <Calendar size={16} />
              プランを見る
            </Button>
          </Link>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard
          title="完了レッスン"
          value={`${stats.completed_lessons} / ${stats.total_lessons}`}
          subtitle={`${Math.round(stats.completion_percentage)}% 完了`}
          icon={<BookOpen size={20} />}
          color="indigo"
          progress={stats.completion_percentage}
        />
        <ProgressCard
          title="連続学習"
          value={`${stats.current_streak_days}日`}
          subtitle="継続は力なり！"
          icon={<Flame size={20} />}
          color="red"
        />
        <ProgressCard
          title="総学習時間"
          value={`${stats.total_study_hours}h`}
          subtitle="積み重ねの成果"
          icon={<Clock size={20} />}
          color="purple"
        />
        <ProgressCard
          title="取得証明書"
          value={`${stats.certificates_earned}枚`}
          subtitle="スキルの証"
          icon={<Award size={20} />}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 次のマイルストーン */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Target size={18} className="text-indigo-500" />
                次のマイルストーン
              </h2>
              <Link href="/learning-plan" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                すべて見る <ChevronRight size={14} />
              </Link>
            </div>

            {stats.next_milestone && (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-indigo-800">{stats.next_milestone.title}</h3>
                    <p className="text-sm text-indigo-600 mt-1">{stats.next_milestone.description}</p>
                  </div>
                  <div className="bg-indigo-100 rounded-lg px-3 py-1 text-xs font-semibold text-indigo-700 whitespace-nowrap ml-3">
                    {new Date(stats.next_milestone.due_date).toLocaleDateString('ja-JP', {
                      month: 'long',
                      day: 'numeric',
                    })}まで
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-indigo-600 mb-1">
                    <span>進捗</span>
                    <span>{stats.completed_lessons}/{stats.total_lessons} レッスン</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.completion_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Link href="/lessons">
                    <Button size="sm" fullWidth>
                      学習を続ける →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* マイルストーン達成状況 */}
            <div className="mt-4 flex items-center gap-2">
              {Array.from({ length: stats.total_milestones }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < stats.completed_milestones ? 'bg-indigo-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              マイルストーン {stats.completed_milestones}/{stats.total_milestones} 達成
            </p>
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-500" />
            最近のアクティビティ
          </h2>

          <div className="space-y-3">
            {stats.recent_activity.map((activity) => {
              const iconStyle = activityIcons[activity.activity_type];
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyle.color}`}>
                    {iconStyle.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.description}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </div>
                  {activity.points && (
                    <span className="text-xs font-bold text-yellow-600 whitespace-nowrap">
                      +{activity.points}pt
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
