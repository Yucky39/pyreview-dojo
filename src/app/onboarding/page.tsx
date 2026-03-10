'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  OnboardingAnswers,
  ProgrammingLanguage,
  SKILL_LEVEL_LABELS,
  SkillLevel,
} from '@/types';
import { useAppStore } from '@/store/useAppStore';
import Button from '@/components/ui/Button';
import LevelBadge from '@/components/ui/LevelBadge';
import toast from 'react-hot-toast';

const TOTAL_STEPS = 6;

const LANGUAGE_OPTIONS: Array<{ value: ProgrammingLanguage; label: string; emoji: string }> = [
  { value: 'javascript', label: 'JavaScript / TypeScript', emoji: '🟡' },
  { value: 'java', label: 'Java', emoji: '☕' },
  { value: 'csharp', label: 'C#', emoji: '🔷' },
  { value: 'cpp', label: 'C / C++', emoji: '⚙️' },
  { value: 'ruby', label: 'Ruby', emoji: '💎' },
  { value: 'go', label: 'Go', emoji: '🐹' },
  { value: 'rust', label: 'Rust', emoji: '🦀' },
  { value: 'php', label: 'PHP', emoji: '🐘' },
  { value: 'other', label: 'その他', emoji: '💻' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboardingAnswers, onboardingAnswers, setOnboardingStep, onboardingStep, aiProvider, aiApiKey } =
    useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedLevel, setDetectedLevel] = useState<SkillLevel | null>(null);

  const step = onboardingStep;

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setOnboardingStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setOnboardingStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (aiApiKey) {
        headers['x-ai-provider'] = aiProvider;
        headers['x-ai-api-key'] = aiApiKey;
      }
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers,
        body: JSON.stringify(onboardingAnswers),
      });

      if (!response.ok) throw new Error('オンボーディングの保存に失敗しました');

      const data = await response.json();
      setDetectedLevel(data.level);
      setOnboardingStep(TOTAL_STEPS - 1);
    } catch {
      toast.error('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-indigo-100 mb-4">
            <span className="text-2xl">🥋</span>
            <span className="font-bold text-indigo-700">PyReview Dojo</span>
          </div>
          <h1 className="text-3xl font-black text-gray-800">
            あなたの学習を始めましょう
          </h1>
          <p className="text-gray-500 mt-2">
            いくつかの質問に答えてあなた専用の学習プランを作成します
          </p>
        </div>

        {/* プログレスバー */}
        {step < TOTAL_STEPS - 1 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>ステップ {step + 1} / {TOTAL_STEPS - 1}</span>
              <span>{Math.round(((step + 1) / (TOTAL_STEPS - 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / (TOTAL_STEPS - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ステップコンテンツ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              {step === 0 && <Step0Experience answers={onboardingAnswers} onChange={setOnboardingAnswers} />}
              {step === 1 && <Step1Languages answers={onboardingAnswers} onChange={setOnboardingAnswers} />}
              {step === 2 && <Step2PythonLevel answers={onboardingAnswers} onChange={setOnboardingAnswers} />}
              {step === 3 && <Step3Goal answers={onboardingAnswers} onChange={setOnboardingAnswers} />}
              {step === 4 && <Step4Hours answers={onboardingAnswers} onChange={setOnboardingAnswers} />}
              {step === 5 && (
                <StepResult
                  level={detectedLevel}
                  answers={onboardingAnswers}
                  onGo={handleGoToDashboard}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ナビゲーション */}
        {step < TOTAL_STEPS - 1 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
            >
              ← 戻る
            </Button>

            {step < TOTAL_STEPS - 2 ? (
              <Button onClick={handleNext}>
                次へ →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
              >
                診断して学習プランを作成 ✨
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== ステップコンポーネント =====

function Step0Experience({
  answers,
  onChange,
}: {
  answers: Partial<OnboardingAnswers>;
  onChange: (a: Partial<OnboardingAnswers>) => void;
}) {
  return (
    <div>
      <div className="text-4xl mb-3 text-center">💡</div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        プログラミング経験はありますか？
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Python以外のプログラミング言語でも構いません
      </p>
      <div className="grid grid-cols-2 gap-4">
        {[
          { value: false, label: 'プログラミング未経験', emoji: '🌱', desc: '初めてコードを書きます' },
          { value: true, label: 'プログラミング経験あり', emoji: '⚡', desc: '他の言語でコードを書いたことがあります' },
        ].map((option) => (
          <button
            key={String(option.value)}
            onClick={() => onChange({ has_programming_experience: option.value })}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              answers.has_programming_experience === option.value
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-3xl mb-2">{option.emoji}</div>
            <div className="font-semibold text-gray-800">{option.label}</div>
            <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step1Languages({
  answers,
  onChange,
}: {
  answers: Partial<OnboardingAnswers>;
  onChange: (a: Partial<OnboardingAnswers>) => void;
}) {
  if (!answers.has_programming_experience) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          プログラミング初挑戦ですね！
        </h2>
        <p className="text-gray-500">
          完全初心者向けのプランで、ゼロから丁寧に学習できます。<br/>
          次のステップへ進んでください。
        </p>
      </div>
    );
  }

  const selected = answers.programming_languages || [];
  const toggle = (lang: ProgrammingLanguage) => {
    const next = selected.includes(lang)
      ? selected.filter((l) => l !== lang)
      : [...selected, lang];
    onChange({ programming_languages: next });
  };

  return (
    <div>
      <div className="text-4xl mb-3 text-center">🔧</div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        使ったことのある言語を選んでください
      </h2>
      <p className="text-center text-gray-500 mb-6">複数選択可</p>
      <div className="grid grid-cols-3 gap-3">
        {LANGUAGE_OPTIONS.map((lang) => (
          <button
            key={lang.value}
            onClick={() => toggle(lang.value)}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              selected.includes(lang.value)
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-indigo-300 text-gray-700'
            }`}
          >
            <span className="mr-1">{lang.emoji}</span>
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2PythonLevel({
  answers,
  onChange,
}: {
  answers: Partial<OnboardingAnswers>;
  onChange: (a: Partial<OnboardingAnswers>) => void;
}) {
  const options = [
    { value: 'none', label: 'ほぼ触ったことがない', emoji: '🌱', desc: 'print("Hello")くらい' },
    { value: 'beginner', label: '少し書いたことがある', emoji: '🌿', desc: '簡単なスクリプトなら書ける' },
    { value: 'intermediate', label: 'ある程度使える', emoji: '🌳', desc: 'ライブラリを使った開発経験あり' },
    { value: 'advanced', label: 'かなり書ける', emoji: '🌲', desc: 'Pythonでの開発経験が豊富' },
  ];

  return (
    <div>
      <div className="text-4xl mb-3 text-center">🐍</div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Pythonの経験はどのくらいですか？
      </h2>
      <p className="text-center text-gray-500 mb-6">現在のレベルに最も近いものを選んでください</p>
      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ python_experience: opt.value as OnboardingAnswers['python_experience'] })}
            className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
              answers.python_experience === opt.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <div className="font-semibold text-gray-800">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.desc}</div>
            </div>
            {answers.python_experience === opt.value && (
              <span className="ml-auto text-indigo-500">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3Goal({
  answers,
  onChange,
}: {
  answers: Partial<OnboardingAnswers>;
  onChange: (a: Partial<OnboardingAnswers>) => void;
}) {
  const goals = [
    { value: 'career', label: 'キャリアアップのため', emoji: '💼', desc: '転職・昇進に活かしたい' },
    { value: 'work', label: '業務で使うため', emoji: '🏢', desc: 'Pythonが必要な仕事に就いた' },
    { value: 'review_skill', label: 'チームのコードレビューのため', emoji: '👥', desc: 'PRレビューができるようになりたい' },
    { value: 'personal', label: '趣味・自己成長', emoji: '🌟', desc: 'Pythonを習得したい' },
  ];

  return (
    <div>
      <div className="text-4xl mb-3 text-center">🎯</div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        学習の目標を教えてください
      </h2>
      <p className="text-center text-gray-500 mb-6">最もあてはまるものを選んでください</p>
      <div className="grid grid-cols-2 gap-3">
        {goals.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onChange({ learning_goal: goal.value as OnboardingAnswers['learning_goal'] })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              answers.learning_goal === goal.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="text-2xl mb-2">{goal.emoji}</div>
            <div className="font-semibold text-gray-800 text-sm">{goal.label}</div>
            <div className="text-xs text-gray-500 mt-1">{goal.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4Hours({
  answers,
  onChange,
}: {
  answers: Partial<OnboardingAnswers>;
  onChange: (a: Partial<OnboardingAnswers>) => void;
}) {
  const options = [
    { value: 3, label: '週3時間以下', emoji: '😌', desc: 'ゆっくりマイペースで' },
    { value: 5, label: '週5時間', emoji: '📚', desc: '通勤時間などを活用' },
    { value: 10, label: '週10時間', emoji: '🔥', desc: '平日1〜2時間程度' },
    { value: 20, label: '週20時間以上', emoji: '⚡', desc: 'がっつり取り組む' },
  ];

  return (
    <div>
      <div className="text-4xl mb-3 text-center">⏰</div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        1週間に学習できる時間は？
      </h2>
      <p className="text-center text-gray-500 mb-6">
        学習期間の計算に使います。無理のない範囲で選んでください
      </p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ available_hours_per_week: opt.value })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              answers.available_hours_per_week === opt.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="text-2xl mb-2">{opt.emoji}</div>
            <div className="font-bold text-gray-800">{opt.label}</div>
            <div className="text-sm text-gray-500">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepResult({
  level,
  answers,
  onGo,
}: {
  level: SkillLevel | null;
  answers: Partial<OnboardingAnswers>;
  onGo: () => void;
}) {
  if (!level && level !== 0) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4 animate-spin">⚙️</div>
        <p className="text-gray-500">学習プランを生成中...</p>
      </div>
    );
  }

  return (
    <div className="text-center animate-bounce-in">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">診断完了！</h2>
      <p className="text-gray-500 mb-6">あなたの現在のレベルは...</p>

      <div className="flex justify-center mb-6">
        <LevelBadge level={level} size="xl" animate />
      </div>

      <div className="bg-indigo-50 rounded-2xl p-5 mb-6 text-left">
        <h3 className="font-bold text-indigo-800 mb-3">📅 あなたの学習プラン</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>週の学習時間</span>
            <span className="font-semibold">{answers.available_hours_per_week}時間</span>
          </div>
          <div className="flex justify-between">
            <span>現在のレベル</span>
            <span className="font-semibold">Level {level}</span>
          </div>
          <div className="flex justify-between">
            <span>目標レベル</span>
            <span className="font-semibold">Level 5 (コードレビュー)</span>
          </div>
          <div className="flex justify-between border-t border-indigo-200 pt-2 mt-2">
            <span className="font-semibold">推定学習期間</span>
            <span className="font-bold text-indigo-700">
              {level === 5 ? '目標達成済み！' :
               level === 4 ? '約4〜8週間' :
               level === 3 ? '約8〜12週間' :
               level === 2 ? '約12〜16週間' :
               level === 1 ? '約12〜20週間' :
               '約20〜28週間'}
            </span>
          </div>
        </div>
      </div>

      <Button size="lg" fullWidth onClick={onGo} className="animate-pulse-glow">
        学習をスタートする 🚀
      </Button>
    </div>
  );
}
