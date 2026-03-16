'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';
import LevelBadge from '@/components/ui/LevelBadge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import toast from 'react-hot-toast';

// デモデータ
const DEMO_PLAN = {
  id: 'plan-1',
  title: '他言語経験者向け Pythonコードレビュースキル習得プラン',
  description: 'JavaScriptの経験を活かし、Pythonの特有の概念から始めてコードレビューまで習得します',
  start_date: '2026-03-10',
  end_date: '2026-07-07',
  total_weeks: 17,
  status: 'active',
  phases: [
    {
      id: 'ph-1',
      phase_number: 1,
      title: 'Python速習（他言語経験者向け）',
      description: '他言語の知識を活かしてPythonの基礎を素早くマスターします',
      weeks: 3,
      start_date: '2026-03-10',
      end_date: '2026-03-31',
      target_level: 2,
      status: 'active',
      milestones: [
        {
          id: 'ms-1',
          title: 'Python基礎文法マスター',
          description: '変数、制御構造、関数、クラスの基礎を習得',
          due_date: '2026-03-24',
          status: 'pending',
        },
        {
          id: 'ms-2',
          title: 'Pythonic Codeの理解',
          description: 'リスト内包表記、ジェネレータ、デコレータを理解',
          due_date: '2026-03-31',
          status: 'pending',
        },
      ],
      lessons: [
        { id: 'l-1', title: 'Python環境構築とHello World', status: 'completed', estimated_minutes: 30 },
        { id: 'l-2', title: '変数・データ型・演算子', status: 'completed', estimated_minutes: 45 },
        { id: 'l-3', title: '制御フロー（if, for, while）', status: 'completed', estimated_minutes: 45 },
        { id: 'l-4', title: '関数とスコープ', status: 'completed', estimated_minutes: 60 },
        { id: 'l-5', title: 'リスト、タプル、辞書、セット', status: 'completed', estimated_minutes: 60 },
        { id: 'l-6', title: 'クラスとオブジェクト指向', status: 'available', estimated_minutes: 75 },
        { id: 'l-7', title: 'エラーハンドリングと例外', status: 'locked', estimated_minutes: 45 },
        { id: 'l-8', title: 'リスト内包表記とジェネレータ', status: 'locked', estimated_minutes: 60 },
      ],
    },
    {
      id: 'ph-2',
      phase_number: 2,
      title: 'Python標準ライブラリと実践',
      description: 'よく使われる標準ライブラリと実践的な開発パターンを学びます',
      weeks: 4,
      start_date: '2026-03-31',
      end_date: '2026-04-28',
      target_level: 3,
      status: 'pending',
      milestones: [
        {
          id: 'ms-3',
          title: '標準ライブラリ活用',
          description: 'os, pathlib, datetime, json等の主要ライブラリを使いこなせる',
          due_date: '2026-04-14',
          status: 'pending',
        },
        {
          id: 'ms-4',
          title: 'テスト駆動開発入門',
          description: 'pytest を使ったテスト作成ができる',
          due_date: '2026-04-28',
          status: 'pending',
        },
      ],
      lessons: [
        { id: 'l-9', title: 'ファイル操作とパス処理', status: 'locked', estimated_minutes: 45 },
        { id: 'l-10', title: '正規表現', status: 'locked', estimated_minutes: 60 },
        { id: 'l-11', title: 'JSONとCSVの処理', status: 'locked', estimated_minutes: 45 },
        { id: 'l-12', title: 'pytestでテストを書く', status: 'locked', estimated_minutes: 90 },
        { id: 'l-13', title: '型ヒントとmypy', status: 'locked', estimated_minutes: 60 },
      ],
    },
    {
      id: 'ph-3',
      phase_number: 3,
      title: 'Pythonアプリケーション開発',
      description: '実際のアプリケーション開発を通じてPythonを深く理解します',
      weeks: 4,
      start_date: '2026-04-28',
      end_date: '2026-05-26',
      target_level: 4,
      status: 'pending',
      milestones: [
        {
          id: 'ms-5',
          title: 'Webスクレイピング実装',
          description: 'requests + BeautifulSoupでスクレイパーを作成',
          due_date: '2026-05-12',
          status: 'pending',
        },
        {
          id: 'ms-6',
          title: 'REST API構築',
          description: 'FastAPIでシンプルなAPIを構築できる',
          due_date: '2026-05-26',
          status: 'pending',
        },
      ],
      lessons: [],
    },
    {
      id: 'ph-4',
      phase_number: 4,
      title: 'コードレビュー実践',
      description: '実際のPythonコードをレビューし、改善提案ができるようになります',
      weeks: 6,
      start_date: '2026-05-26',
      end_date: '2026-07-07',
      target_level: 5,
      status: 'pending',
      milestones: [
        {
          id: 'ms-7',
          title: 'コードレビュー基礎',
          description: 'チェックリストを使った体系的なレビューができる',
          due_date: '2026-06-16',
          status: 'pending',
        },
        {
          id: 'ms-8',
          title: 'コードレビューマスター',
          description: '実務レベルのレビューコメントが書ける',
          due_date: '2026-07-07',
          status: 'pending',
        },
      ],
      lessons: [],
    },
  ],
};

export default function LearningPlanPage() {
  const [plan, setPlan] = useState(DEMO_PLAN);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['ph-1']));
  const [isSyncingNotion, setIsSyncingNotion] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  useEffect(() => {
    fetch('/api/learning-plan')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setPlan(data); })
      .catch(() => {/* デモデータを維持 */});
  }, []);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleSyncNotion = async () => {
    setIsSyncingNotion(true);
    try {
      const res = await fetch('/api/integrations/notion', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Notionに同期しました！');
    } catch {
      toast.error('Notionとの連携を設定してください（設定 > 連携）');
    } finally {
      setIsSyncingNotion(false);
    }
  };

  const handleSyncGoogle = async () => {
    setIsSyncingGoogle(true);
    try {
      const res = await fetch('/api/integrations/google', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Google Calendarに同期しました！');
    } catch {
      toast.error('Google Calendarとの連携を設定してください（設定 > 連携）');
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  const totalLessons = plan.phases.reduce((acc, p) => acc + p.lessons.length, 0);
  const completedLessons = plan.phases.reduce(
    (acc, p) => acc + p.lessons.filter((l) => l.status === 'completed').length,
    0
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">学習プラン</h1>
        <p className="text-gray-500 mt-1">{plan.description}</p>
      </div>

      {/* プラン概要 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h2 className="font-bold text-gray-800 text-lg">{plan.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-indigo-500" />
                <span>
                  {new Date(plan.start_date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                  {' 〜 '}
                  {new Date(plan.end_date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-indigo-500" />
                <span>{plan.total_weeks}週間</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy size={16} className="text-indigo-500" />
                <span>{completedLessons}/{totalLessons} レッスン完了</span>
              </div>
            </div>
          </div>

          {/* 連携ボタン */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncNotion}
              loading={isSyncingNotion}
            >
              <ExternalLink size={14} />
              Notionに同期
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncGoogle}
              loading={isSyncingGoogle}
            >
              <Calendar size={14} />
              Googleカレンダーに追加
            </Button>
          </div>
        </div>

        {/* 全体進捗バー */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>全体進捗</span>
            <span>{Math.round((completedLessons / Math.max(totalLessons, 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${(completedLessons / Math.max(totalLessons, 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* フェーズ一覧 */}
      <div className="space-y-3">
        {plan.phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase.id);
          const phaseLessons = phase.lessons;
          const completedPhaseLessons = phaseLessons.filter((l) => l.status === 'completed').length;

          return (
            <div
              key={phase.id}
              className={clsx(
                'bg-white rounded-2xl shadow-sm border overflow-hidden transition-all',
                phase.status === 'active' ? 'border-indigo-200' : 'border-gray-100'
              )}
            >
              {/* フェーズヘッダー */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                <LevelBadge level={phase.target_level as 0 | 1 | 2 | 3 | 4 | 5} size="sm" showLabel={false} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">
                      フェーズ {phase.phase_number} · {phase.weeks}週間
                    </span>
                    {phase.status === 'active' && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        進行中
                      </span>
                    )}
                    {phase.status === 'completed' && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        完了
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mt-0.5">{phase.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{phase.description}</p>
                </div>

                {phaseLessons.length > 0 && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-700">
                      {completedPhaseLessons}/{phaseLessons.length}
                    </div>
                    <div className="text-xs text-gray-400">レッスン</div>
                  </div>
                )}

                {isExpanded ? (
                  <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* フェーズ詳細 */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-5">
                  {/* マイルストーン */}
                  <div className="mt-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                      <Trophy size={14} className="text-yellow-500" />
                      マイルストーン
                    </h4>
                    <div className="space-y-2">
                      {phase.milestones.map((ms) => (
                        <div
                          key={ms.id}
                          className={clsx(
                            'flex items-start gap-3 p-3 rounded-xl border',
                            ms.status === 'completed'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          )}
                        >
                          {ms.status === 'completed' ? (
                            <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle size={18} className="text-gray-300 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-800">{ms.title}</div>
                            <div className="text-xs text-gray-500">{ms.description}</div>
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(ms.due_date).toLocaleDateString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* レッスン一覧 */}
                  {phaseLessons.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-indigo-500" />
                        レッスン
                      </h4>
                      <div className="space-y-1">
                        {phaseLessons.map((lesson, i) => (
                          <Link
                            key={lesson.id}
                            href={lesson.status !== 'locked' ? `/lessons/${lesson.id}` : '#'}
                            className={clsx(
                              'flex items-center gap-3 p-3 rounded-xl transition-all group',
                              lesson.status === 'completed'
                                ? 'bg-green-50 hover:bg-green-100'
                                : lesson.status === 'available'
                                  ? 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                                  : 'bg-gray-50 opacity-60 cursor-not-allowed'
                            )}
                          >
                            <div
                              className={clsx(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                                lesson.status === 'completed'
                                  ? 'bg-green-500 text-white'
                                  : lesson.status === 'available'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                              )}
                            >
                              {lesson.status === 'completed' ? (
                                <CheckCircle2 size={14} />
                              ) : lesson.status === 'locked' ? (
                                <Lock size={10} />
                              ) : (
                                i + 1
                              )}
                            </div>

                            <span
                              className={clsx(
                                'text-sm font-medium flex-1',
                                lesson.status === 'completed'
                                  ? 'text-green-700 line-through'
                                  : lesson.status === 'available'
                                    ? 'text-indigo-700'
                                    : 'text-gray-500'
                              )}
                            >
                              {lesson.title}
                            </span>

                            <span className="text-xs text-gray-400">{lesson.estimated_minutes}分</span>

                            {lesson.status === 'available' && (
                              <ChevronRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {phaseLessons.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      前のフェーズを完了するとレッスンが解放されます
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
