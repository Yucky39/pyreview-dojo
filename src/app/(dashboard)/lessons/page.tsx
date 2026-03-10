'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { clsx } from 'clsx';

const LESSONS = [
  { id: 'l-1', title: 'Python環境構築とHello World', phase: 1, type: 'theory', status: 'completed', estimated_minutes: 30, difficulty: 1, tags: ['環境構築', '基礎'] },
  { id: 'l-2', title: '変数・データ型・演算子', phase: 1, type: 'theory', status: 'completed', estimated_minutes: 45, difficulty: 1, tags: ['変数', 'データ型'] },
  { id: 'l-3', title: '制御フロー（if, for, while）', phase: 1, type: 'theory', status: 'completed', estimated_minutes: 45, difficulty: 1, tags: ['制御構造', 'ループ'] },
  { id: 'l-4', title: '関数とスコープ', phase: 1, type: 'theory', status: 'completed', estimated_minutes: 60, difficulty: 2, tags: ['関数', 'スコープ'] },
  { id: 'l-5', title: 'リスト、タプル、辞書、セット', phase: 1, type: 'exercise', status: 'completed', estimated_minutes: 60, difficulty: 2, tags: ['コレクション', 'データ構造'] },
  { id: 'l-6', title: 'クラスとオブジェクト指向', phase: 1, type: 'theory', status: 'available', estimated_minutes: 75, difficulty: 3, tags: ['OOP', 'クラス'] },
  { id: 'l-7', title: 'エラーハンドリングと例外', phase: 1, type: 'theory', status: 'locked', estimated_minutes: 45, difficulty: 2, tags: ['例外処理'] },
  { id: 'l-8', title: 'リスト内包表記とジェネレータ', phase: 1, type: 'exercise', status: 'locked', estimated_minutes: 60, difficulty: 3, tags: ['内包表記', 'Pythonic'] },
  { id: 'l-9', title: 'ファイル操作とパス処理', phase: 2, type: 'theory', status: 'locked', estimated_minutes: 45, difficulty: 2, tags: ['ファイル', 'pathlib'] },
  { id: 'l-10', title: '正規表現', phase: 2, type: 'exercise', status: 'locked', estimated_minutes: 60, difficulty: 3, tags: ['正規表現', 're'] },
];

const typeLabels = {
  theory: { label: '理論', color: 'bg-blue-100 text-blue-700' },
  exercise: { label: '演習', color: 'bg-orange-100 text-orange-700' },
  review: { label: 'レビュー', color: 'bg-purple-100 text-purple-700' },
};

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'completed'>('all');

  const filtered = LESSONS.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags.some((t) => t.includes(searchQuery));
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'available' && lesson.status === 'available') ||
      (filterStatus === 'completed' && lesson.status === 'completed');
    return matchesSearch && matchesFilter;
  });

  const completedCount = LESSONS.filter((l) => l.status === 'completed').length;
  const availableCount = LESSONS.filter((l) => l.status === 'available').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">レッスン一覧</h1>
        <p className="text-gray-500 mt-1">
          {completedCount}レッスン完了 · {availableCount}レッスン受講可能
        </p>
      </div>

      {/* 検索・フィルター */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="レッスンを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'available', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={clsx(
                'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {status === 'all' ? 'すべて' : status === 'available' ? '受講可能' : '完了済み'}
            </button>
          ))}
        </div>
      </div>

      {/* レッスン一覧 */}
      <div className="space-y-2">
        {filtered.map((lesson) => (
          <Link
            key={lesson.id}
            href={lesson.status !== 'locked' ? `/lessons/${lesson.id}` : '#'}
            className={clsx(
              'flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border transition-all group',
              lesson.status === 'locked'
                ? 'border-gray-100 opacity-60 cursor-not-allowed'
                : lesson.status === 'available'
                  ? 'border-indigo-200 hover:shadow-md hover:border-indigo-300'
                  : 'border-gray-100 hover:shadow-md'
            )}
          >
            {/* ステータスアイコン */}
            <div
              className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                lesson.status === 'completed'
                  ? 'bg-green-100'
                  : lesson.status === 'available'
                    ? 'bg-indigo-100'
                    : 'bg-gray-100'
              )}
            >
              {lesson.status === 'completed' ? (
                <CheckCircle2 size={20} className="text-green-600" />
              ) : lesson.status === 'locked' ? (
                <Lock size={20} className="text-gray-400" />
              ) : (
                <BookOpen size={20} className="text-indigo-600" />
              )}
            </div>

            {/* コンテンツ */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={clsx(
                    'text-sm font-semibold',
                    lesson.status === 'completed'
                      ? 'text-gray-500 line-through'
                      : lesson.status === 'available'
                        ? 'text-indigo-800'
                        : 'text-gray-600'
                  )}
                >
                  {lesson.title}
                </span>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', typeLabels[lesson.type as keyof typeof typeLabels].color)}>
                  {typeLabels[lesson.type as keyof typeof typeLabels].label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {lesson.estimated_minutes}分
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < lesson.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  {lesson.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {lesson.status !== 'locked' && (
              <ChevronRight
                size={18}
                className={clsx(
                  'flex-shrink-0 transition-transform group-hover:translate-x-1',
                  lesson.status === 'available' ? 'text-indigo-400' : 'text-gray-300'
                )}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
