import { NextRequest, NextResponse } from 'next/server';
import { AIProvider, AIProviderConfig, AI_PROVIDER_MODELS, getDefaultConfig } from '@/lib/ai-provider';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  const provider = (req.headers.get('x-ai-provider') || 'anthropic') as AIProvider;
  const apiKey = req.headers.get('x-ai-api-key') || '';

  const config: AIProviderConfig = apiKey
    ? { provider, apiKey }
    : (getDefaultConfig() ?? { provider: 'anthropic', apiKey: '' });

  if (!config.apiKey) {
    return NextResponse.json({ ok: false, error: 'API キーが設定されていません' });
  }

  try {
    if (config.provider === 'anthropic') {
      const client = new Anthropic({ apiKey: config.apiKey });
      await client.messages.create({
        model: AI_PROVIDER_MODELS.anthropic,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }],
      });
    } else if (config.provider === 'openai') {
      const client = new OpenAI({ apiKey: config.apiKey });
      await client.chat.completions.create({
        model: AI_PROVIDER_MODELS.openai,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }],
      });
    } else if (config.provider === 'gemini') {
      const client = new GoogleGenerativeAI(config.apiKey);
      const model = client.getGenerativeModel({ model: AI_PROVIDER_MODELS.gemini });
      await model.generateContent('hi');
    }

    return NextResponse.json({
      ok: true,
      provider: config.provider,
      model: AI_PROVIDER_MODELS[config.provider],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json({ ok: false, error: message });
  }
}
