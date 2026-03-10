import { NextRequest, NextResponse } from 'next/server';
import { evaluateCodeSubmission, AIProvider, AIProviderConfig, getDefaultConfig } from '@/lib/ai-provider';
import { SkillLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { code, prompt, type, level } = await req.json();

    if (!code || !prompt) {
      return NextResponse.json({ error: 'code and prompt are required' }, { status: 400 });
    }

    const provider = (req.headers.get('x-ai-provider') || 'anthropic') as AIProvider;
    const apiKey = req.headers.get('x-ai-api-key') || '';
    const config: AIProviderConfig = apiKey
      ? { provider, apiKey }
      : (getDefaultConfig() ?? { provider: 'anthropic', apiKey: '' });

    if (!config.apiKey) {
      return NextResponse.json({
        feedback: {
          overall_score: 0,
          summary: 'AI プロバイダーが設定されていません。設定画面で API キーを登録してください。',
          strengths: [],
          improvements: ['設定画面から AI プロバイダーの API キーを設定してください'],
          detailed_comments: [],
          next_steps: [],
        },
      });
    }

    const feedback = await evaluateCodeSubmission(
      code,
      prompt,
      type || 'coding',
      (level as SkillLevel) || 1,
      config
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('AI evaluate error:', error);
    return NextResponse.json(
      {
        feedback: {
          overall_score: 70,
          summary: '評価サービスが一時的に利用できません。後でもう一度お試しください。',
          strengths: ['コードが提出されました'],
          improvements: ['後でAI評価を受けてください'],
          detailed_comments: [],
          next_steps: [],
        },
      },
      { status: 200 }
    );
  }
}
