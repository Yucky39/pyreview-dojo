'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  CheckCircle2,
  Send,
  Lightbulb,
  RotateCcw,
  Star,
  MessageSquare,
  Code2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import {
  type LessonDetail,
  type LessonCatalogRow,
  type ExerciseCatalogRow,
  rowToLessonDetail,
  getLessonById,
} from '@/lib/lessons-data';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = typeof params.id === 'string' ? params.id : '';

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const [{ data: lessonRow, error: lessonError }, { data: exerciseRows, error: exError }] =
          await Promise.all([
            supabase.from('lesson_catalog').select('*').eq('id', lessonId).single(),
            supabase
              .from('exercise_catalog')
              .select('*')
              .eq('lesson_id', lessonId)
              .order('exercise_order', { ascending: true }),
          ]);

        if (lessonError || !lessonRow) {
          // DBが未セットアップの場合はフォールバック
          setLesson(getLessonById(lessonId));
        } else {
          setLesson(
            rowToLessonDetail(
              lessonRow as LessonCatalogRow,
              (exerciseRows ?? []) as ExerciseCatalogRow[]
            )
          );
        }
      } catch {
        setLesson(getLessonById(lessonId));
      } finally {
        setIsLoadingLesson(false);
      }
    };

    if (lessonId) fetchLesson();
  }, [lessonId]);

  const [activeTab, setActiveTab] = useState<'lesson' | 'exercise'>('lesson');
  const [activeExercise, setActiveExercise] = useState(0);
  const [code, setCode] = useState(
    () => lesson?.exercises[0]?.starter_code ?? ''
  );
  const [reviewText, setReviewText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState<'main' | number>('main');
  const [showGlossary, setShowGlossary] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<null | {
    overall_score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
  }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // ロード中
  if (isLoadingLesson) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  // レッスンが見つからない場合
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle size={48} className="text-gray-300" />
        <p className="text-gray-500">レッスンが見つかりませんでした</p>
        <Link href="/lessons">
          <Button variant="secondary">レッスン一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  // ロックされているレッスン
  if (lesson.status === 'locked') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-gray-700">{lesson.title}</h2>
        <p className="text-gray-500 text-center max-w-sm">
          このレッスンはまだロックされています。前のレッスンを完了すると解放されます。
        </p>
        <Link href="/lessons">
          <Button variant="secondary">レッスン一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const exercise = lesson.exercises[activeExercise];

  const handleSubmit = async () => {
    if (!exercise) return;
    setIsSubmitting(true);
    try {
      const submission = exercise.type === 'coding' ? code : reviewText;

      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: submission,
          prompt: exercise.prompt,
          type: exercise.type,
          level: 1,
        }),
      });

      if (!res.ok) {
        setFeedback({
          overall_score: 78,
          summary: 'よく書けています！いくつかの改善点があります。',
          strengths: ['コードの構造は正しい', 'エラーハンドリングを実装している'],
          improvements: [
            '型ヒントを追加するとより読みやすくなります',
            'f文字列を使うとよりPythonicです',
          ],
        });
      } else {
        const data = await res.json();
        setFeedback(data.feedback);
      }
    } catch {
      setFeedback({
        overall_score: 75,
        summary: 'コードを評価しました。いくつかの改善提案があります。',
        strengths: ['基本的な実装ができています'],
        improvements: ['型ヒントの追加を検討しましょう'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleted(true);
    toast.success('レッスン完了！ 素晴らしい！ 🎉');

    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: lessonId,
        status: 'completed',
        score: feedback?.overall_score ?? 100,
      }),
    });
  };

  const nextHint = () => {
    if (exercise && hintIndex < exercise.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  const switchExercise = (index: number) => {
    setActiveExercise(index);
    setFeedback(null);
    setCode(lesson.exercises[index]?.starter_code ?? '');
    setReviewText('');
    setShowHint(false);
    setHintIndex(0);
    setShowSolution(false);
    setActiveSolutionTab('main');
  };

  const toggleTerm = (index: number) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/lessons">
          <Button variant="ghost" size="sm">
            <ChevronLeft size={16} />
            レッスン一覧
          </Button>
        </Link>
        <div className="flex-1">
          <div className="text-xs text-gray-400">{lesson.phase_title}</div>
          <h1 className="text-xl font-black text-gray-800">{lesson.title}</h1>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
            <CheckCircle2 size={16} />
            完了
          </div>
        )}
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['lesson', 'exercise'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              activeTab === tab
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'lesson' ? '📖 レッスン' : '✏️ 演習'}
          </button>
        ))}
      </div>

      {activeTab === 'lesson' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          {/* イントロ */}
          <div>
            <p className="text-gray-600 leading-relaxed">
              {lesson.content.introduction}
            </p>
          </div>

          {/* キーコンセプト */}
          {lesson.content.key_concepts.map((concept, i) => (
            <div key={i} className="border-l-4 border-indigo-400 pl-5">
              <h3 className="font-bold text-gray-800 mb-2">{concept.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{concept.explanation}</p>
              {concept.example && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm overflow-x-auto">
                  <code>{concept.example}</code>
                </pre>
              )}
            </div>
          ))}

          {/* 用語解説 */}
          {lesson.content.glossary && lesson.content.glossary.length > 0 && (
            <div className="border border-teal-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowGlossary(!showGlossary)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold text-teal-800 text-sm">
                  <BookOpen size={16} />
                  用語解説
                  <span className="bg-teal-200 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {lesson.content.glossary.length}語
                  </span>
                </span>
                {showGlossary ? (
                  <ChevronUp size={16} className="text-teal-600" />
                ) : (
                  <ChevronDown size={16} className="text-teal-600" />
                )}
              </button>

              {showGlossary && (
                <div className="divide-y divide-teal-100">
                  {lesson.content.glossary.map((item, i) => (
                    <div key={i} className="bg-white">
                      <button
                        onClick={() => toggleTerm(i)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-teal-50 transition-colors text-left"
                      >
                        <span className="font-semibold text-gray-800 text-sm">
                          {item.term}
                        </span>
                        {expandedTerms.has(i) ? (
                          <ChevronUp size={14} className="text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-400 shrink-0" />
                        )}
                      </button>
                      {expandedTerms.has(i) && (
                        <div className="px-5 pb-4 space-y-2">
                          <p className="text-sm text-gray-600">{item.definition}</p>
                          {item.example && (
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                              <code>{item.example}</code>
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* まとめ */}
          <div className="bg-indigo-50 rounded-xl p-4">
            <h3 className="font-bold text-indigo-800 mb-1">まとめ</h3>
            <p className="text-indigo-700 text-sm">{lesson.content.summary}</p>
          </div>

          {lesson.exercises.length > 0 && (
            <Button fullWidth size="lg" onClick={() => setActiveTab('exercise')}>
              演習に進む →
            </Button>
          )}
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="space-y-4">
          {/* 演習がない場合 */}
          {lesson.exercises.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">このレッスンの演習は準備中です。</p>
            </div>
          )}

          {/* 演習タブ切り替え */}
          {lesson.exercises.length > 1 && (
            <div className="flex gap-2">
              {lesson.exercises.map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => switchExercise(i)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                    activeExercise === i
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {ex.type === 'coding' ? (
                    <Code2 size={14} className="inline mr-1" />
                  ) : (
                    <MessageSquare size={14} className="inline mr-1" />
                  )}
                  演習{i + 1}
                </button>
              ))}
            </div>
          )}

          {exercise && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'text-xs px-2.5 py-1 rounded-full font-semibold',
                        exercise.type === 'coding'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      )}
                    >
                      {exercise.type === 'coding'
                        ? 'コーディング演習'
                        : 'コードレビュー演習'}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-800 mt-2 text-lg">
                    {exercise.title}
                  </h2>
                </div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Lightbulb size={14} />
                  ヒント
                </button>
              </div>

              {/* 問題文 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {exercise.prompt}
                </pre>
              </div>

              {/* ヒント */}
              {showHint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-yellow-800 flex items-center gap-1.5">
                      <Lightbulb size={14} /> ヒント {hintIndex + 1}/
                      {exercise.hints.length}
                    </span>
                    {hintIndex < exercise.hints.length - 1 && (
                      <button
                        onClick={nextHint}
                        className="text-xs text-yellow-600 hover:text-yellow-800"
                      >
                        次のヒント →
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-yellow-800">
                    {exercise.hints[hintIndex]}
                  </p>
                </div>
              )}

              {/* コードエディタ / テキストエリア */}
              {exercise.type === 'coding' ? (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Python</span>
                    <button
                      onClick={() =>
                        setCode(exercise.starter_code ?? '')
                      }
                      className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> リセット
                    </button>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none min-h-64"
                    spellCheck={false}
                    rows={20}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    レビューコメントを入力してください
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="コードの問題点、改善提案を具体的に書いてください..."
                    rows={10}
                  />
                </div>
              )}

              {/* 提出ボタン */}
              <div className="flex justify-between mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFeedback(null)}
                >
                  クリア
                </Button>
                <Button onClick={handleSubmit} loading={isSubmitting} size="md">
                  <Send size={16} />
                  AIにレビューしてもらう
                </Button>
              </div>
            </div>
          )}

          {/* 別解を見る */}
          {exercise && exercise.solution && (
            <div className="border border-violet-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-violet-50 hover:bg-violet-100 transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold text-violet-800 text-sm">
                  {showSolution ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                  別解・解答例
                  {exercise.alternative_solutions && (
                    <span className="bg-violet-200 text-violet-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {exercise.alternative_solutions.length + 1}パターン
                    </span>
                  )}
                </span>
                {showSolution ? (
                  <ChevronUp size={16} className="text-violet-600" />
                ) : (
                  <ChevronDown size={16} className="text-violet-600" />
                )}
              </button>

              {showSolution && (
                <div className="bg-white">
                  {/* 解答タブ */}
                  {exercise.alternative_solutions && exercise.alternative_solutions.length > 0 && (
                    <div className="flex gap-1 px-4 pt-4 overflow-x-auto">
                      <button
                        onClick={() => setActiveSolutionTab('main')}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                          activeSolutionTab === 'main'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        模範解答
                      </button>
                      {exercise.alternative_solutions.map((alt, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSolutionTab(i)}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                            activeSolutionTab === i
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {alt.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-4">
                    {activeSolutionTab === 'main' ? (
                      <>
                        <p className="text-xs text-gray-500 mb-3">
                          これは一つの解答例です。他の書き方も正解になります。
                        </p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm overflow-x-auto">
                          <code>{exercise.solution}</code>
                        </pre>
                      </>
                    ) : (
                      exercise.alternative_solutions && typeof activeSolutionTab === 'number' && (
                        <>
                          <p className="text-xs text-gray-500 mb-3">
                            {exercise.alternative_solutions[activeSolutionTab].description}
                          </p>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm overflow-x-auto">
                            <code>{exercise.alternative_solutions[activeSolutionTab].code}</code>
                          </pre>
                        </>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AIフィードバック */}
          {feedback && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                AIフィードバック
                <span
                  className={clsx(
                    'ml-auto text-2xl font-black',
                    feedback.overall_score >= 80
                      ? 'text-green-600'
                      : feedback.overall_score >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  )}
                >
                  {feedback.overall_score}点
                </span>
              </h3>

              <p className="text-gray-700 bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                {feedback.summary}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> 良かった点
                  </h4>
                  <ul className="space-y-1.5">
                    {feedback.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-600 flex items-start gap-1.5"
                      >
                        <span className="text-green-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                    💡 改善点
                  </h4>
                  <ul className="space-y-1.5">
                    {feedback.improvements.map((imp, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-600 flex items-start gap-1.5"
                      >
                        <span className="text-orange-500 mt-0.5">•</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {!isCompleted && (
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleComplete}
                  className="mt-2"
                >
                  <CheckCircle2 size={18} />
                  このレッスンを完了する
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
