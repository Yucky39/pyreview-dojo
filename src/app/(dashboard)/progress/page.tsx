'use client';

import {
  Trophy,
  BookOpen,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Target,
  BarChart3,
} from 'lucide-react';
import { SkillLevel, SKILL_LEVEL_LABELS } from '@/types';
import LevelBadge, { LevelProgress } from '@/components/ui/LevelBadge';
import ProgressCard from '@/components/ui/ProgressCard';

// デモ用の週次学習データ
const WEEKLY_DATA = [
  { week: '2/10', hours: 3.5 },
  { week: '2/17', hours: 5.0 },
  { week: '2/24', hours: 4.0 },
  { week: '3/3', hours: 6.5 },
  { week: '3/10', hours: 2.0 },
];

const PHASE_PROGRESS = [
  { name: 'Python速習', completed: 5, total: 8, level: 2 as SkillLevel },
  { name: '標準ライブラリ', completed: 0, total: 5, level: 3 as SkillLevel },
  { name: 'アプリ開発', completed: 0, total: 6, level: 4 as SkillLevel },
  { name: 'コードレビュー', completed: 0, total: 7, level: 5 as SkillLevel },
];

const SCORE_HISTORY = [
  { date: '3/1', exercise: 'リスト操作', score: 72 },
  { date: '3/3', exercise: '辞書・セット演習', score: 85 },
  { date: '3/5', exercise: '関数設計', score: 78 },
  { date: '3/7', exercise: 'クラス実装', score: 90 },
  { date: '3/9', exercise: 'コードレビュー入門', score: 68 },
];

const maxHours = Math.max(...WEEKLY_DATA.map((d) => d.hours));

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">進捗・統計</h1>
        <p className="text-gray-500 mt-1">学習の進み具合を確認しましょう</p>
      </div>

      {/* 現在のレベル */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-indigo-200 text-sm">現在のレベル</p>
            <h2 className="text-3xl font-black mt-1">
              {SKILL_LEVEL_LABELS[1 as SkillLevel]}
            </h2>
          </div>
          <LevelBadge level={1} size="xl" showLabel={false} />
        </div>
        <div className="mt-2">
          <p className="text-indigo-200 text-sm mb-3">目標: Level 5 · コードレビュー</p>
          <LevelProgress currentLevel={1} />
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard
          title="完了レッスン"
          value="5 / 26"
          subtitle="19.2% 完了"
          icon={<BookOpen size={20} />}
          color="indigo"
          progress={19.2}
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
          value="21h"
          subtitle="今週: 2h"
          icon={<Clock size={20} />}
          color="purple"
        />
        <ProgressCard
          title="平均スコア"
          value="78.6点"
          subtitle="最高: 90点"
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
            {WEEKLY_DATA.map((d) => (
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
          <div className="space-y-2">
            {SCORE_HISTORY.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-xs text-gray-400 w-10 flex-shrink-0">{item.date}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate">{item.exercise}</div>
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
        </div>
      </div>

      {/* フェーズ別進捗 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Target size={18} className="text-indigo-500" />
          フェーズ別進捗
        </h2>
        <div className="space-y-4">
          {PHASE_PROGRESS.map((phase, i) => {
            const percentage = Math.round((phase.completed / phase.total) * 100);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <LevelBadge level={phase.level} size="sm" showLabel={false} />
                    <span className="font-medium text-gray-700 text-sm">{phase.name}</span>
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
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <LevelBadge level={1} size="md" showLabel={false} />
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Python速習マスター</div>
            <div className="text-sm text-gray-500">Level 1 · 発行日: 2026年3月5日</div>
          </div>
          <div className="text-xs font-mono text-gray-400">PRD-ABCD-EFGH-IJKL</div>
        </div>

        <p className="text-sm text-gray-400 mt-3 text-center">
          次の証明書まで: Level 2 達成まであと 3 レッスン
        </p>
      </div>
    </div>
  );
}
