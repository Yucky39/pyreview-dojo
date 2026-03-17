# PyReview Dojo プレゼンテーション資料

## ファイル一覧

| ファイル | 説明 |
|----------|------|
| `presentation.md` | 3分間プレゼン用スライド（Marp形式・Material Design） |
| `marp-theme.css` | Material Design カスタムテーマ |

## プレゼンテーションの見方

### 方法1: Marp CLI でブラウザプレビュー（推奨）

```bash
npx @marp-team/marp-cli docs/presentation.md --preview
```

ブラウザでスライドが開きます。Material Design テーマ（`marp-theme.css`）が自動で適用されます。

### 方法2: PDF / HTML にエクスポート

```bash
npx @marp-team/marp-cli docs/presentation.md -o docs/presentation.pdf
npx @marp-team/marp-cli docs/presentation.md -o docs/presentation.html
```

テーマが反映されない場合は、`--theme` を明示的に指定してください：

```bash
npx @marp-team/marp-cli docs/presentation.md --preview --theme docs/marp-theme.css
```

### 方法3: VS Code + Marp 拡張機能

1. [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) をインストール
2. `presentation.md` を開く
3. コマンドパレット → 「Marp: Toggle Marp Feature For Current Markdown」→ プレビューを開く

### 方法4: 通常のMarkdownとして読む

`presentation.md` は通常のMarkdownとしても読めます。`---` で区切られた各ブロックが1スライドです。

## デザイン

Material Design を基調としたテーマを適用しています。

- **フォント**: Noto Sans JP（日本語）、Roboto（英数字）
- **カラーパレット**: プライマリ青 (#1976D2)、アクセントシアン (#00BCD4)
- **視認性**: 十分なコントラスト、読みやすい行間・文字サイズ

## プレゼン時間の目安

- **合計**: 約3分
- **スライド数**: 12枚
- **1スライドあたり**: 約15秒
