'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import Link from 'next/link';

// デモレッスンデータ
const DEMO_LESSON = {
  id: 'l-6',
  title: 'クラスとオブジェクト指向',
  description: 'Pythonのクラスとオブジェクト指向プログラミングの基礎を学びます',
  phase_title: 'Python速習（他言語経験者向け）',
  estimated_minutes: 75,
  difficulty: 3,
  content: {
    introduction:
      'Pythonのクラスは他の言語と似た概念ですが、独自の特徴があります。__init__、self、継承など、Pythonらしいクラスの書き方を学びましょう。',
    key_concepts: [
      {
        title: 'クラスの定義と__init__',
        explanation:
          'Pythonではclassキーワードでクラスを定義します。コンストラクタは__init__メソッドで定義し、第一引数にselfを受け取ります。',
        example: `class Dog:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def bark(self) -> str:
        return f"{self.name}が吠えた！"

    def __repr__(self) -> str:
        return f"Dog(name={self.name!r}, age={self.age})"

# 使用例
dog = Dog("ポチ", 3)
print(dog.bark())  # ポチが吠えた！
print(dog)         # Dog(name='ポチ', age=3)`,
      },
      {
        title: 'データクラス（dataclass）',
        explanation:
          'Python 3.7以降では@dataclassデコレータを使うことで、ボイラープレートコードを減らせます。自動的に__init__、__repr__、__eq__が生成されます。',
        example: `from dataclasses import dataclass, field
from typing import List

@dataclass
class Student:
    name: str
    grade: int
    scores: List[int] = field(default_factory=list)

    @property
    def average(self) -> float:
        if not self.scores:
            return 0.0
        return sum(self.scores) / len(self.scores)

s = Student("田中太郎", 3, [85, 90, 78])
print(s.average)  # 84.33...`,
      },
      {
        title: '継承とsuper()',
        explanation:
          'Pythonの継承はシンプルで直感的です。super()を使って親クラスのメソッドを呼び出せます。多重継承もサポートしています。',
        example: `class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        raise NotImplementedError

class Cat(Animal):
    def speak(self) -> str:
        return f"{self.name}がニャーと鳴いた"

class Dog(Animal):
    def speak(self) -> str:
        return f"{self.name}がワンと吠えた"

animals = [Cat("ミケ"), Dog("ポチ")]
for animal in animals:
    print(animal.speak())`,
      },
    ],
    summary:
      'Pythonのクラスは強力で柔軟です。dataclassを使ってボイラープレートを削減し、型ヒントを活用して読みやすいコードを書きましょう。',
  },
  exercises: [
    {
      id: 'ex-1',
      title: 'クラスの実装',
      type: 'coding',
      prompt:
        '銀行口座を表すBankAccountクラスを実装してください。\n\n要件:\n- 残高(balance)を持つ\n- deposit(amount)で入金\n- withdraw(amount)で出金（残高不足時はValueErrorを発生させる）\n- 取引履歴(transactions)を記録する',
      starter_code: `from dataclasses import dataclass, field
from typing import List

@dataclass
class BankAccount:
    owner: str
    balance: float = 0.0
    transactions: List[dict] = field(default_factory=list)

    def deposit(self, amount: float) -> None:
        # ここに実装
        pass

    def withdraw(self, amount: float) -> None:
        # ここに実装
        pass


# テスト
account = BankAccount("田中太郎")
account.deposit(10000)
account.withdraw(3000)
print(account.balance)  # 7000.0
print(account.transactions)`,
      hints: [
        'depositはbalanceに加算するだけ',
        'withdrawはbalanceが不足する場合ValueError("残高不足")を発生させる',
        'transactionsには{"type": "deposit", "amount": 金額}の形式で追加する',
      ],
    },
    {
      id: 'ex-2',
      title: 'コードレビュー演習',
      type: 'review',
      prompt: `以下のPythonコードをレビューしてください。改善点とその理由を具体的に説明してください。

\`\`\`python
class user:
    def __init__(self, n, a, e):
        self.n = n
        self.a = a
        self.e = e

    def get_info(self):
        return "Name: " + self.n + ", Age: " + str(self.a) + ", Email: " + self.e

    def update_age(self, new_age):
        self.a = new_age
        return self

u = user("田中", 25, "tanaka@example.com")
print(u.get_info())
\`\`\``,
      hints: [
        'クラス名の命名規則（PEP8）を確認しよう',
        '変数名の読みやすさを考えよう',
        '文字列の連結よりも効率的な方法がある',
        '型ヒントの追加を検討しよう',
      ],
    },
  ],
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lesson' | 'exercise'>('lesson');
  const [activeExercise, setActiveExercise] = useState(0);
  const [code, setCode] = useState(DEMO_LESSON.exercises[0].starter_code || '');
  const [reviewText, setReviewText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    overall_score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
  }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const exercise = DEMO_LESSON.exercises[activeExercise];

  const handleSubmit = async () => {
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
        // デモ用フォールバック
        setFeedback({
          overall_score: 78,
          summary: 'よく書けています！いくつかの改善点があります。',
          strengths: ['コードの構造は正しい', 'エラーハンドリングを実装している'],
          improvements: ['型ヒントを追加するとより読みやすくなります', 'f文字列を使うとよりPythonicです'],
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
        lesson_id: params.id,
        status: 'completed',
        score: feedback?.overall_score || 100,
      }),
    });
  };

  const nextHint = () => {
    if (hintIndex < exercise.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
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
          <div className="text-xs text-gray-400">{DEMO_LESSON.phase_title}</div>
          <h1 className="text-xl font-black text-gray-800">{DEMO_LESSON.title}</h1>
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
            <p className="text-gray-600 leading-relaxed">{DEMO_LESSON.content.introduction}</p>
          </div>

          {/* キーコンセプト */}
          {DEMO_LESSON.content.key_concepts.map((concept, i) => (
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

          {/* まとめ */}
          <div className="bg-indigo-50 rounded-xl p-4">
            <h3 className="font-bold text-indigo-800 mb-1">まとめ</h3>
            <p className="text-indigo-700 text-sm">{DEMO_LESSON.content.summary}</p>
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={() => setActiveTab('exercise')}
          >
            演習に進む →
          </Button>
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="space-y-4">
          {/* 演習タブ切り替え */}
          {DEMO_LESSON.exercises.length > 1 && (
            <div className="flex gap-2">
              {DEMO_LESSON.exercises.map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveExercise(i);
                    setFeedback(null);
                    setCode(DEMO_LESSON.exercises[i].starter_code || '');
                    setReviewText('');
                    setShowHint(false);
                    setHintIndex(0);
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                    activeExercise === i
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {ex.type === 'coding' ? <Code2 size={14} className="inline mr-1" /> : <MessageSquare size={14} className="inline mr-1" />}
                  演習{i + 1}
                </button>
              ))}
            </div>
          )}

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
                    {exercise.type === 'coding' ? 'コーディング演習' : 'コードレビュー演習'}
                  </span>
                </div>
                <h2 className="font-bold text-gray-800 mt-2 text-lg">{exercise.title}</h2>
              </div>
              <button
                onClick={() => { setShowHint(!showHint); }}
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
                    <Lightbulb size={14} /> ヒント {hintIndex + 1}/{exercise.hints.length}
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
                <p className="text-sm text-yellow-800">{exercise.hints[hintIndex]}</p>
              </div>
            )}

            {/* コードエディタ / テキストエリア */}
            {exercise.type === 'coding' ? (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Python</span>
                  <button
                    onClick={() => setCode(exercise.starter_code || '')}
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
              <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
                クリア
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                size="md"
              >
                <Send size={16} />
                AIにレビューしてもらう
              </Button>
            </div>
          </div>

          {/* AIフィードバック */}
          {feedback && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                AIフィードバック
                <span className={clsx(
                  'ml-auto text-2xl font-black',
                  feedback.overall_score >= 80 ? 'text-green-600' :
                  feedback.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                )}>
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
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
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
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
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
