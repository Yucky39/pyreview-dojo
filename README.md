# PyReview Dojo 🥋

**PythonコードレビュースキルをAIと共に磨く学習プラットフォーム**

完全初学者からコードレビューができるレベルまで、スキル診断・カスタム学習プラン・AIフィードバックで段階的に成長できるWebアプリです。

---

## 概要

PyReview Dojo は、Pythonを学ぶすべての人がコードレビューできるレベル（Level 5）を目指して学習できる日本語ネイティブのWebアプリです。

| スキルレベル | 説明 |
|---|---|
| 🌱 Level 0 | 完全初学者（プログラミング未経験） |
| ⚡ Level 1 | 他言語経験者（Python未経験） |
| 📗 Level 2 | Python入門（簡単なスクリプトが書ける） |
| 🔥 Level 3 | Python基礎（基本文法を理解、ライブラリ使用可） |
| 💎 Level 4 | Python中級（アプリ開発可能、設計を意識できる） |
| 🏆 Level 5 | Pythonコードレビュー（他者のコードを評価・改善できる） |

---

## 主な機能

### スキル診断 & カスタム学習プラン
- 6ステップのオンボーディングで現在のスキルレベルを自動診断
- AIが現在レベルから Level 5 までの個人最適化された学習プランを生成
- フェーズ・マイルストーン・レッスン構成をAIが自動設計

### AIコードレビュー & 学習サポート
- **コーディング演習**・**コードレビュー演習**をAIがリアルタイム評価
- 100点満点スコア + 強み / 改善点 / 行単位の詳細コメントを提供
- レベルに応じた丁寧さと深さで初心者にも優しいフィードバック
- AIチャットでレッスン中の質問をいつでも相談できる

### 対応AIプロバイダー
| プロバイダー | モデル |
|---|---|
| Claude (Anthropic) | claude-sonnet-4-6 |
| ChatGPT (OpenAI) | gpt-4o |
| Gemini (Google) | gemini-2.0-flash |

設定画面から独自APIキーで切り替え可能。

### 進捗ダッシュボード
- 学習時間・スコア履歴・連続学習日数（ストリーク）を可視化
- マイルストーン達成状況と次の目標を一覧表示
- 最近のアクティビティログ（レッスン完了・レベルアップなど）

### レベル認定証
- 各レベルのマイルストーン達成時に認定証を発行
- QRコード付き検証コードで第三者が認定レベルを確認可能
- PDF ダウンロード・SNS シェア対応

### 外部サービス連携
- **Notion** — マイルストーンをNotionデータベースで管理
- **Google Calendar** — 学習スケジュールをカレンダーに自動登録

### 認証
- メール & パスワード登録
- Google / GitHub ソーシャルログイン（Supabase Auth）
- メール確認・パスワードリセット対応

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| 状態管理 | Zustand |
| アニメーション | Framer Motion |
| 認証 / DB | Supabase (Auth + PostgreSQL) |
| AI | Anthropic SDK / OpenAI SDK / Google Generative AI |
| 外部連携 | Notion API, Google Calendar API |
| PDF生成 | jsPDF + html2canvas |
| QRコード | qrcode |
| UIアイコン | lucide-react |
| ユニットテスト | Vitest + Testing Library |
| E2Eテスト | Playwright |

---

## セットアップ

### 前提条件
- Node.js 20 以上
- Supabase プロジェクト

### 環境変数

`.env.local` を作成し、以下を設定します。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI プロバイダー（いずれか1つ以上を設定）
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Google OAuth（任意）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Notion（任意）
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

# アプリURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### データベースセットアップ

Supabase の SQL エディタで `supabase/schema.sql` を実行します。

### インストール & 起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint
npm run test         # ユニットテスト（Vitest）
npm run test:watch   # ウォッチモード
npm run test:e2e     # E2Eテスト（Playwright）
```

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (dashboard)/        # 認証後の画面
│   │   ├── dashboard/      # ダッシュボード
│   │   ├── lessons/        # レッスン一覧 & 詳細
│   │   ├── learning-plan/  # 学習プラン
│   │   ├── progress/       # 進捗
│   │   ├── certificates/   # 認定証
│   │   └── settings/       # 設定（AI・外部連携・プロフィール）
│   ├── api/                # APIルート
│   ├── auth/               # 認証ページ（ログイン・登録・リセット）
│   ├── onboarding/         # スキル診断 & プラン生成
│   └── verify/             # 認定証検証（公開URL）
├── components/
│   ├── auth/               # AuthProvider, ソーシャルログイン
│   └── ui/                 # 共通UIコンポーネント
├── lib/
│   ├── ai-provider.ts      # AI プロバイダー抽象化層
│   ├── certificate.ts      # 認定証生成
│   ├── lessons-data.ts     # レッスンデータ共有型
│   ├── notion.ts           # Notion 連携
│   └── google.ts           # Google Calendar 連携
├── store/
│   └── useAppStore.ts      # グローバル状態（Zustand）
└── types/
    └── index.ts            # 型定義
```

---

## ライセンス

Private
