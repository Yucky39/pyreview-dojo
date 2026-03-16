'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  BookOpen,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Target,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { SkillLevel, SKILL_LEVEL_LABELS } from '@/types';
import LevelBadge, { LevelProgress } from '@/components/ui/LevelBadge';
import ProgressCard from '@/components/ui/ProgressCard';
import { LESSONS } from '@/lib/lessons-data';

// フォールバック用デモデータ
const FALLBACK_WEEKLY_DATA = [
  { week: '2/10', hours: 3.5 },
  { week: '2/17', hours: 5.0 },
  { week: '2/24', hours: 4.0 },
  { week: '3/3', hours: 6.5 },
  { week: '3/10', hours: 2.0 },
];

const FALLBACK_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Python速習マスター',
    level: 1 as SkillLevel,
    issued_at: '2026年3月5日',
    verification_code: 'PRD-ABCD-EFGH-IJKL',
  },
];

interface ProgressRecord {
  id: string;
  lesson_id: string;
  exercise_id?: string;
  status: 'started' | 'completed' | 'skipped';
  score?: number;
  time_spent_minutes: number;
  completed_at?: string;
  created_at: string;
}

interface ComputedStats {
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  averageScore: number;
  bestScore: number;
  totalMinutes: number;
  scoreHistory: Array<{ date: string; lessonTitle: string; score: number }>;
  phaseProgress: Array<{
    name: string;
    completed: number;
    total: number;
    level: SkillLevel;
  }>;
}

function computeStats(progress: ProgressRecord[]): ComputedStats {
  const completedProgress = progress.filter((p) => p.status === 'completed');
  const completedLessonIds = new Set(completedProgress.map((p) => p.lesson_id));
  const completedLessons = completedLessonIds.size;
  const totalLessons = LESSONS.length;
  const completionPercentage =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  const scores = completedProgress
    .filter((p) => p.score != null)
    .map((p) => p.score as number);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const totalMinutes = progress.reduce(
    (sum, p) => sum + (p.time_spent_minutes ?? 0),
    0
  );

  // スコア履歴（最新5件）
  const scoreHistory = completedProgress
    .filter((p) => p.score != null && p.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    )
    .slice(0, 5)
    .map((p) => {
      const lesson = LESSONS.find((l) => l.id === p.lesson_id);
      const date = p.completed_at
        ? new Date(p.completed_at).toLocaleDateString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
          })
        : '—';
      return {
        date,
        lessonTitle: lesson?.title ?? p.lesson_id,
        score: p.score as number,
      };
    })
    .reverse();

  // フェーズ別進捗
  const phaseMap = new Map<
    number,
    { name: string; completed: number; total: number; level: SkillLevel }
  >();
  LESSONS.forEach((lesson) => {
    if (!phaseMap.has(lesson.phase)) {
      phaseMap.set(lesson.phase, {
        name: lesson.phase_title,
        completed: 0,
        total: 0,
        level: Math.min(lesson.phase + 1, 5) as SkillLevel,
      });
    }
    const phase = phaseMap.get(lesson.phase)!;
    phase.total += 1;
    if (completedLessonIds.has(lesson.id)) {
      phase.completed += 1;
    }
  });
  const phaseProgress = Array.from(phaseMap.values());

  return {
    completedLessons,
    totalLessons,
    completionPercentage,
    averageScore,
    bestScore,
    totalMinutes,
    scoreHistory,
    phaseProgress,
  };
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch('/api/progress');
        if (!res.ok) throw new Error('取得失敗');
        const data = await res.json();
        setProgress(data.progress ?? []);
        // データが空ならフォールバック表示
        if (!data.progress || data.progress.length === 0) {
          setUseFallback(true);
        }
      } catch {
        setUseFallback(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgress();
  }, []);

  // フォールバック用デモ進捗データ
  const DEMO_PROGRESS: ProgressRecord[] = [
    { id: '1', lesson_id: 'l-1', status: 'completed', score: 95, time_spent_minutes: 25, completed_at: '2026-03-01T10:00:00Z', created_at: '2026-03-01T10:00:00Z' },
    { id: '2', lesson_id: 'l-2', status: 'completed', score: 85, time_spent_minutes: 40, completed_at: '2026-03-03T10:00:00Z', created_at: '2026-03-03T10:00:00Z' },
    { id: '3', lesson_id: 'l-3', status: 'completed', score: 78, time_spent_minutes: 45, completed_at: '2026-03-05T10:00:00Z', created_at: '2026-03-05T10:00:00Z' },
    { id: '4', lesson_id: 'l-4', status: 'completed', score: 90, time_spent_minutes: 55, completed_at: '2026-03-07T10:00:00Z', created_at: '2026-03-07T10:00:00Z' },
    { id: '5', lesson_id: 'l-5', status: 'completed', score: 68, time_spent_minutes: 60, completed_at: '2026-03-09T10:00:00Z', created_at: '2026-03-09T10:00:00Z' },
  ];

  const displayProgress = useFallback ? DEMO_PROGRESS : progress;
  const stats = computeStats(displayProgress);
  const weeklyData = FALLBACK_WEEKLY_DATA;
  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  // 現在レベルを進捗から推定
  const currentLevel: SkillLevel = stats.completedLessons >= 8
    ? 2
    : stats.completedLessons >= 5
      ? 1
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">進捗・統計</h1>
        <p className="text-gray-500 mt-1">学習の進み具合を確認しましょう</p>
        {useFallback && (
          <p className="text-xs text-gray-400 mt-1">
            ※ データベース未接続のためデモデータを表示しています
          </p>
        )}
      </div>

      {/* 現在のレベル */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-indigo-200 text-sm">現在のレベル</p>
            <h2 className="text-3xl font-black mt-1">
              {SKILL_LEVEL_LABELS[currentLevel]}
            </h2>
          </div>
          <LevelBadge level={currentLevel} size="xl" showLabel={false} />
        </div>
        <div className="mt-2">
          <p className="text-indigo-200 text-sm mb-3">目標: Level 5 · コードレビュー</p>
          <LevelProgress currentLevel={currentLevel} />
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard
          title="完了レッスン"
          value={`${stats.completedLessons} / ${stats.totalLessons}`}
          subtitle={`${stats.completionPercentage}% 完了`}
          icon={<BookOpen size={20} />}
          color="indigo"
          progress={stats.completionPercentage}
        />
        <ProgressCard
          title="連続学習"
          value="4日"
          subtitle="最長: 7日"
          icon={<Flame size={20} />}
          color="red"
        />
        <ProgressCard
          title="総学習時間"
          value={`${Math.round(stats.totalMinutes / 60)}h`}
          subtitle={`${stats.totalMinutes}分`}
          icon={<Clock size={20} />}
          color="purple"
        />
        <ProgressCard
          title="平均スコア"
          value={`${stats.averageScore}点`}
          subtitle={`最高: ${stats.bestScore}点`}
          icon={<Trophy size={20} />}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 週次学習グラフ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-indigo-500" />
            週次学習時間
          </h2>
          <div className="flex items-end gap-3 h-32">
            {weeklyData.map((d) => (
              <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500 font-medium">{d.hours}h</div>
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all"
                  style={{ height: `${(d.hours / maxHours) * 100}px` }}
                />
                <div className="text-xs text-gray-400">{d.week}</div>
              </div>
            ))}
          </div>
        </div>

        {/* スコア履歴 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-500" />
            演習スコア履歴
          </h2>
          {stats.scoreHistory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              まだスコア履歴がありません
            </p>
          ) : (
            <div className="space-y-2">
              {stats.scoreHistory.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-10 flex-shrink-0">
                    {item.date}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">
                      {item.lessonTitle}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.score >= 80
                            ? 'bg-green-500'
                            : item.score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-400'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold w-12 text-right ${
                      item.score >= 80
                        ? 'text-green-600'
                        : item.score >= 60
                          ? 'text-yellow-600'
                          : 'text-red-500'
                    }`}
                  >
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* フェーズ別進捗 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Target size={18} className="text-indigo-500" />
          フェーズ別進捗
        </h2>
        <div className="space-y-4">
          {stats.phaseProgress.map((phase, i) => {
            const percentage =
              phase.total > 0
                ? Math.round((phase.completed / phase.total) * 100)
                : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <LevelBadge
                      level={phase.level}
                      size="sm"
                      showLabel={false}
                    />
                    <span className="font-medium text-gray-700 text-sm">
                      {phase.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {phase.completed}/{phase.total} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 取得済み証明書 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Award size={18} className="text-yellow-500" />
          取得済み証明書
        </h2>
        {FALLBACK_CERTIFICATES.map((cert) => (
          <div
            key={cert.id}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
          >
            <LevelBadge level={cert.level} size="md" showLabel={false} />
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{cert.title}</div>
              <div className="text-sm text-gray-500">
                Level {cert.level} · 発行日: {cert.issued_at}
              </div>
            </div>
            <div className="text-xs font-mono text-gray-400">
              {cert.verification_code}
            </div>
          </div>
        ))}

        <p className="text-sm text-gray-400 mt-3 text-center">
          次の証明書まで: Level 2 達成まであと{' '}
          {Math.max(0, 8 - stats.completedLessons)} レッスン
        </p>
      </div>
    </div>
  );
}
