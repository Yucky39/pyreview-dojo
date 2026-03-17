'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import {
  type LessonMeta,
  type LessonCatalogRow,
  rowToLessonMeta,
  LESSONS,
} from '@/lib/lessons-data';

const typeLabels = {
  theory: { label: '理論', color: 'bg-blue-100 text-blue-700' },
  exercise: { label: '演習', color: 'bg-orange-100 text-orange-700' },
  review: { label: 'レビュー', color: 'bg-purple-100 text-purple-700' },
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'completed'>('all');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('lesson_catalog')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
          // DBが未セットアップの場合はハードコードデータにフォールバック
          setLessons(LESSONS);
        } else {
          setLessons((data as LessonCatalogRow[]).map(rowToLessonMeta));
        }
      } catch {
        setLessons(LESSONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const filtered = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags.some((t) => t.includes(searchQuery));
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'available' && lesson.status === 'available') ||
      (filterStatus === 'completed' && lesson.status === 'completed');
    return matchesSearch && matchesFilter;
  });

  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  const availableCount = lessons.filter((l) => l.status === 'available').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">レッスン一覧</h1>
        <p className="text-gray-500 mt-1">
          {isLoading ? '読み込み中...' : `${completedCount}レッスン完了 · ${availableCount}レッスン受講可能`}
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

      {/* ロード中 */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="text-indigo-400 animate-spin" />
        </div>
      )}

      {/* レッスン一覧 */}
      {!isLoading && (
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
      )}
    </div>
  );
}
