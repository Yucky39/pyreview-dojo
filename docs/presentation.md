---
marp: true
theme: marp-theme.css
paginate: true
---

<!-- _class: title -->

# PyReview Dojo
## Pythonコードレビュースキル習得のための学習プラットフォーム

**3分間プレゼンテーション**

---

## プロジェクト概要

**PyReview Dojo** は、Pythonのコードレビュー能力を段階的に習得するためのWebアプリケーションです。

- 🐍 Python初学者からコードレビュアーまで対応
- 🤖 AIによるパーソナライズされた学習支援
- 📱 モダンなWeb技術で構築

---

## 解決する課題

| 課題 | 解決策 |
|------|--------|
| 独学ではコードレビューの基準が分からない | AIが具体的なフィードバックを提供 |
| 自分のレベルに合った教材が見つからない | オンボーディングでスキル診断し、カスタムプラン生成 |
| 学習の継続が難しい | Notion・Google Calendar連携でスケジュール管理 |

---

## 主な機能（1/2）

### スキル診断 & 学習プラン
- プログラミング経験・Python経験・学習目標を質問
- **Claude / ChatGPT / Gemini** のいずれかでAI診断
- 0〜5のスキルレベル判定と、個人専用の学習プラン自動生成

### AIコードレビュー
- 演習で提出したコードをAIが評価
- スコア・良かった点・改善点・具体的なコメントを返却
- Pythonicな書き方を学べる

---

## 主な機能（2/2）

### 外部連携
- **Notion**: マイルストーンをタスク管理、学習計画の概要ページ作成
- **Google Calendar**: フェーズ開始・マイルストーン・学習完了日を自動登録

### 認定証システム
- 各レベル達成時にPDF証明書を発行
- QRコード付きで第三者によるレベル確認が可能

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 16, React 19 |
| データベース | Supabase (PostgreSQL) |
| AI | Anthropic Claude, OpenAI GPT-4o, Google Gemini |
| 連携 | Notion API, Google Calendar API |
| 認証 | NextAuth |
| デプロイ | Vercel |

---

## アーキテクチャ概要

```
[ユーザー] → [Next.js App] → [API Routes]
                  ↓
         [AI Provider (Claude/OpenAI/Gemini)]
                  ↓
         [Supabase] ← [Notion / Google Calendar]
```

- マルチAIプロバイダー対応（設定画面で切り替え）
- サーバーサイドでAPIキー管理、クライアントに露出しない

---

## 学習フロー

1. **オンボーディング** → 5ステップの質問でプロフィール作成
2. **スキル診断** → AIがレベル0〜5を判定
3. **学習プラン生成** → フェーズ・マイルストーン・レッスン構成を自動生成
4. **レッスン学習** → 理論 + コーディング演習 + AIフィードバック
5. **マイルストーン達成** → 認定証発行、Notion/Calendarに反映

---

## ダッシュボード機能

- **進捗サマリー**: 現在レベル、完了率、連続学習日数
- **次のマイルストーン**: 達成目標の表示
- **最近のアクティビティ**: レッスン完了、演習提出、証明書発行
- **週次学習グラフ**: 学習時間の可視化
- **証明書一覧**: 取得済み認定証の管理・ダウンロード

---

## デモ・リポジトリ

- **デモURL**: [pyreview-dojo.vercel.app](https://pyreview-dojo.vercel.app)
- **GitHub**: [github.com/Yucky39/pyreview-dojo](https://github.com/Yucky39/pyreview-dojo)

---

<!-- _class: footer -->

## まとめ

**PyReview Dojo** は、

- AIを活用した**パーソナライズ学習**
- **マルチAI対応**（Claude / ChatGPT / Gemini）
- **Notion・Google Calendar連携**による実務的な学習管理
- **認定証**によるスキルの可視化

を実現する、Pythonコードレビュースキル習得プラットフォームです。

**ご清聴ありがとうございました**
