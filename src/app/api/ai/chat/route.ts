import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse, AIProvider, AIProviderConfig, getDefaultConfig } from '@/lib/ai-provider';
import { SkillLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { messages, level, currentLesson } = await req.json();

    const provider = (req.headers.get('x-ai-provider') || 'anthropic') as AIProvider;
    const apiKey = req.headers.get('x-ai-api-key') || '';
    const config: AIProviderConfig = apiKey
      ? { provider, apiKey }
      : (getDefaultConfig() ?? { provider: 'anthropic', apiKey: '' });

    if (!config.apiKey) {
      return NextResponse.json({
        message: 'AI プロバイダーが設定されていません。設定画面で API キーを登録してください。',
      });
    }

    const response = await getChatResponse(
      messages,
      { level: (level as SkillLevel) || 1, currentLesson },
      config
    );

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('AIチャットエラー:', error);
    return NextResponse.json(
      { message: 'AIアシスタントが一時的に利用できません。後でもう一度お試しください。' },
      { status: 200 }
    );
  }
}
