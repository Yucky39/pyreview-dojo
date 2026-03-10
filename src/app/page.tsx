import Link from 'next/link';
import {
  Zap,
  Target,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react';

const SKILL_LEVELS = [
  { level: 0, label: '完全初学者', emoji: '🌱', color: 'bg-green-100 text-green-700' },
  { level: 1, label: '他言語経験者', emoji: '⚡', color: 'bg-blue-100 text-blue-700' },
  { level: 2, label: 'Python入門', emoji: '📗', color: 'bg-yellow-100 text-yellow-700' },
  { level: 3, label: 'Python基礎', emoji: '🔥', color: 'bg-orange-100 text-orange-700' },
  { level: 4, label: 'Python中級', emoji: '💎', color: 'bg-purple-100 text-purple-700' },
  { level: 5, label: 'コードレビュー', emoji: '🏆', color: 'bg-pink-100 text-pink-700' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'スキル診断&カスタムプラン',
    description: '現在のプログラミングスキルを診断し、あなた専用の学習プランを自動生成します',
  },
  {
    icon: '🤖',
    title: 'AIコードレビュー',
    description: 'Claude AIが提出コードを詳しく評価。Pythonicなコードの書き方を学べます',
  },
  {
    icon: '📅',
    title: 'Notion / Google Calendar連携',
    description: 'マイルストーンをNotionで管理、学習スケジュールをGoogleカレンダーに自動登録',
  },
  {
    icon: '🏅',
    title: 'レベル認定証',
    description: '各レベル達成時に認定証を発行。QRコードで管理者がレベルを確認できます',
  },
  {
    icon: '📊',
    title: '進捗ダッシュボード',
    description: '学習時間、スコア履歴、マイルストーン達成状況を一目で確認できます',
  },
  {
    icon: '🌐',
    title: '日本語ネイティブUI',
    description: '日本語学習者向けに設計。継続したくなる楽しい学習体験を提供します',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-black text-gray-800 text-lg">PyReview Dojo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              ダッシュボード
            </Link>
            <Link
              href="/onboarding"
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-indigo-50 via-purple-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Star size={14} className="fill-indigo-500" />
            Claude AI搭載の次世代Python学習プラットフォーム
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Pythonコードレビューの
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              プロになろう
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            完全初心者から他言語エンジニアまで、あなたのスキルレベルに合わせたオーダーメイドの学習プランで、
            <strong>Pythonコードレビューができるレベル</strong>を目指します
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95"
            >
              無料で学習スタート
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all"
            >
              デモを見る
            </Link>
          </div>

          {/* スキルレベル表示 */}
          <div className="flex flex-wrap justify-center gap-2">
            {SKILL_LEVELS.map((item) => (
              <div
                key={item.level}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${item.color}`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
                {item.level < 5 && (
                  <ArrowRight size={12} className="opacity-60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              PyReview Dojoの特徴
            </h2>
            <p className="text-gray-500 text-lg">
              学習を楽しく、効果的に、管理しやすくする機能が揃っています
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 学習フローセクション */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              学習の流れ
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'スキル診断',
                description: '5分程度の質問に答えてあなたの現在のスキルレベルを診断',
                icon: <Target size={24} />,
                color: 'bg-indigo-500',
              },
              {
                step: '02',
                title: 'カスタム学習プラン作成',
                description: 'AIがあなた専用の学習プランを生成。NotionとGoogle Calendarに自動同期',
                icon: <Calendar size={24} />,
                color: 'bg-purple-500',
              },
              {
                step: '03',
                title: 'レッスン&演習',
                description: 'レベルに合わせたレッスンとコーディング・レビュー演習をAIが評価',
                icon: <BookOpen size={24} />,
                color: 'bg-pink-500',
              },
              {
                step: '04',
                title: 'マイルストーン&証明書',
                description: '各レベルを達成すると認定証を発行。管理者が認証コードでレベルを確認可能',
                icon: <Award size={24} />,
                color: 'bg-amber-500',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">STEP {item.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                </div>
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 行動喚起セクション */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <div className="text-5xl mb-6">🥋</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            今すぐPythonの道場へ
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            無料で始めて、あなたのスキルを証明しよう
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-2xl text-lg font-black hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            無料で学習スタート
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-bold text-white">PyReview Dojo</span>
        </div>
        <p>© 2026 PyReview Dojo. Pythonコードレビュースキルを磨く学習プラットフォーム</p>
      </footer>
    </div>
  );
}
