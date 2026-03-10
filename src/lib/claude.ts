import Anthropic from '@anthropic-ai/sdk';
import { OnboardingAnswers, SkillLevel, AIFeedback } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ===== スキルレベル診断 =====

export async function assessSkillLevel(answers: OnboardingAnswers): Promise<SkillLevel> {
  const prompt = `
あなたはPython学習の専門家です。以下のユーザー回答を分析し、0〜5のスキルレベルを判定してください。

スキルレベル定義:
- 0: 完全初学者（プログラミング未経験）
- 1: 他言語経験者（Python未経験または少し触った程度）
- 2: Python入門（簡単なスクリプトが書ける）
- 3: Python基礎（基本文法を理解、ライブラリ使用可）
- 4: Python中級（アプリ開発可能、設計を意識できる）
- 5: コードレビュー可能（他者のコードを評価・改善できる）

ユーザー回答:
- プログラミング経験: ${answers.has_programming_experience ? 'あり' : 'なし'}
- 経験のある言語: ${answers.programming_languages.join(', ') || 'なし'}
- Pythonの経験: ${answers.python_experience}
- 学習目標: ${answers.learning_goal}
- 週の学習時間: ${answers.available_hours_per_week}時間

数字のみ（0〜5の整数）を返してください。
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 10,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '1';
  const level = parseInt(text, 10);
  return (isNaN(level) ? 1 : Math.min(5, Math.max(0, level))) as SkillLevel;
}

// ===== 学習プラン生成 =====

export async function generateLearningPlan(
  userId: string,
  level: SkillLevel,
  answers: OnboardingAnswers
): Promise<{
  title: string;
  description: string;
  totalWeeks: number;
  phases: Array<{
    phaseNumber: number;
    title: string;
    description: string;
    weeks: number;
    targetLevel: SkillLevel;
    milestones: Array<{ title: string; description: string; weekOffset: number }>;
    lessonTitles: string[];
  }>;
}> {
  const prompt = `
あなたはPython学習カリキュラムの専門家です。以下の情報をもとに最適な学習プランをJSON形式で設計してください。

現在のレベル: ${level} (${['完全初学者', '他言語経験者', 'Python入門', 'Python基礎', 'Python中級', 'コードレビュー可能'][level]})
目標レベル: 5 (Pythonコードレビュー)
週の学習可能時間: ${answers.available_hours_per_week}時間
学習目標: ${answers.learning_goal}
学習スタイル: ${answers.preferred_learning_style}

以下のJSON形式で返してください（他のテキストは含めないこと）:
{
  "title": "学習プランのタイトル",
  "description": "プランの説明",
  "totalWeeks": 総週数,
  "phases": [
    {
      "phaseNumber": 1,
      "title": "フェーズのタイトル",
      "description": "フェーズの説明",
      "weeks": 週数,
      "targetLevel": 到達目標レベル(0-5),
      "milestones": [
        {
          "title": "マイルストーンのタイトル",
          "description": "達成基準の説明",
          "weekOffset": フェーズ開始からの週数
        }
      ],
      "lessonTitles": ["レッスン1タイトル", "レッスン2タイトル", ...]
    }
  ]
}

注意事項:
- 現在のレベルに応じてフェーズ数と内容を最適化すること
- 各フェーズには最低1つのマイルストーンを設けること
- 実践的なコードレビュー演習を後半フェーズに含めること
- 日本語で記述すること
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('学習プランのJSON解析に失敗しました');

  return JSON.parse(jsonMatch[0]);
}

// ===== コード提出の評価 =====

export async function evaluateCodeSubmission(
  code: string,
  exercisePrompt: string,
  exerciseType: 'coding' | 'review',
  level: SkillLevel
): Promise<AIFeedback> {
  const prompt = `
あなたはPythonの専門家であり、${level <= 2 ? '初心者向けに丁寧で励ましを忘れない' : '建設的で詳細な'}フィードバックを提供する講師です。

演習の内容: ${exercisePrompt}

${exerciseType === 'coding' ? '提出されたコード:' : 'コードレビューコメント:'}
\`\`\`${exerciseType === 'coding' ? 'python' : ''}
${code}
\`\`\`

以下のJSON形式で詳細なフィードバックを返してください:
{
  "overall_score": 0〜100の整数,
  "summary": "全体的な評価（2〜3文）",
  "strengths": ["良かった点1", "良かった点2"],
  "improvements": ["改善点1", "改善点2"],
  "detailed_comments": [
    {
      "line": 行番号(任意),
      "category": "カテゴリ(readability/performance/security/pythonic/correctness)",
      "severity": "info/warning/error",
      "message": "具体的なコメント",
      "suggestion": "改善提案(任意)"
    }
  ],
  "next_steps": ["次のステップ1", "次のステップ2"]
}

注意:
- レベル${level}のユーザー向けに適切な難易度のフィードバックを提供すること
- Pythonicなコードの書き方を重視すること
- 励ましのコメントを必ず含めること
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      overall_score: 0,
      summary: 'フィードバックの生成に失敗しました',
      strengths: [],
      improvements: [],
      detailed_comments: [],
      next_steps: [],
    };
  }

  return JSON.parse(jsonMatch[0]);
}

// ===== AIチャットサポート =====

export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: { level: SkillLevel; currentLesson?: string }
): Promise<string> {
  const systemPrompt = `
あなたはPython学習アプリ「PyReview Dojo」の学習サポートAIです。
ユーザーのレベルは${context.currentLesson ? `「${context.currentLesson}」を学習中の` : ''}レベル${context.level}です。

役割:
- Pythonに関する質問に分かりやすく答える
- コードの改善提案を行う
- 学習のモチベーションを維持する励ましをする
- 日本語で丁寧に回答する
- レベルに応じた説明の深さを調整する（初心者には比喩や例を多用）

現在学習中のレッスン: ${context.currentLesson || '未設定'}
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// ===== レッスンコンテンツ生成 =====

export async function generateLessonContent(
  lessonTitle: string,
  phaseTitle: string,
  level: SkillLevel
): Promise<{
  introduction: string;
  key_concepts: Array<{ title: string; explanation: string; example?: string }>;
  summary: string;
}> {
  const prompt = `
あなたはPython教育の専門家です。以下のレッスンのコンテンツをJSON形式で生成してください。

レッスンタイトル: ${lessonTitle}
フェーズ: ${phaseTitle}
対象レベル: ${level} (${['完全初学者', '他言語経験者', 'Python入門', 'Python基礎', 'Python中級', 'コードレビュー可能'][level]})

以下のJSON形式で返してください:
{
  "introduction": "レッスンの導入文（200字程度）",
  "key_concepts": [
    {
      "title": "概念のタイトル",
      "explanation": "分かりやすい説明",
      "example": "Pythonコードの例（任意）"
    }
  ],
  "summary": "まとめ（100字程度）"
}

注意:
- レベルに応じた難易度と表現を使用すること
- 実践的な例を含めること
- 日本語で記述すること
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('レッスンコンテンツのJSON解析に失敗しました');

  return JSON.parse(jsonMatch[0]);
}
