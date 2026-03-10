import { NextRequest, NextResponse } from 'next/server';
import { assessSkillLevel, generateLearningPlan, AIProvider, AIProviderConfig, getDefaultConfig } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';
import { OnboardingAnswers, SkillLevel } from '@/types';
import { addWeeks, format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const answers: OnboardingAnswers = await req.json();

    const authHeader = req.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    const provider = (req.headers.get('x-ai-provider') || 'anthropic') as AIProvider;
    const apiKey = req.headers.get('x-ai-api-key') || '';
    const config: AIProviderConfig = apiKey
      ? { provider, apiKey }
      : (getDefaultConfig() ?? { provider: 'anthropic', apiKey: '' });

    if (!config.apiKey) {
      return NextResponse.json({
        level: 1 as SkillLevel,
        plan: null,
        message: 'AI プロバイダーが未設定のためデフォルトレベルを使用します。設定画面で API キーを登録してください。',
      });
    }

    // 1. AIでスキルレベルを診断
    const level = await assessSkillLevel(answers, config);

    // 2. 学習プランを生成
    const planData = await generateLearningPlan(userId, level, answers, config);

    // 3. データベースに保存
    const startDate = new Date();
    const endDate = addWeeks(startDate, planData.totalWeeks);

    const { data: plan, error: planError } = await supabase
      .from('learning_plans')
      .insert({
        user_id: userId,
        title: planData.title,
        description: planData.description,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        total_weeks: planData.totalWeeks,
        status: 'active',
      })
      .select()
      .single();

    if (planError) {
      console.error('Plan insert error:', planError);
    }

    if (plan) {
      let phaseStartDate = startDate;
      for (const phaseData of planData.phases) {
        const phaseEndDate = addWeeks(phaseStartDate, phaseData.weeks);

        const { data: phase, error: phaseError } = await supabase
          .from('learning_phases')
          .insert({
            plan_id: plan.id,
            phase_number: phaseData.phaseNumber,
            title: phaseData.title,
            description: phaseData.description,
            weeks: phaseData.weeks,
            start_date: format(phaseStartDate, 'yyyy-MM-dd'),
            end_date: format(phaseEndDate, 'yyyy-MM-dd'),
            target_level: phaseData.targetLevel,
            status: phaseData.phaseNumber === 1 ? 'active' : 'pending',
          })
          .select()
          .single();

        if (!phaseError && phase) {
          for (const ms of phaseData.milestones) {
            const milestoneDate = addWeeks(phaseStartDate, ms.weekOffset);
            await supabase.from('milestones').insert({
              phase_id: phase.id,
              title: ms.title,
              description: ms.description,
              due_date: format(milestoneDate, 'yyyy-MM-dd'),
              status: 'pending',
            });
          }

          for (let i = 0; i < phaseData.lessonTitles.length; i++) {
            await supabase.from('lessons').insert({
              phase_id: phase.id,
              lesson_order: i + 1,
              title: phaseData.lessonTitles[i],
              lesson_type: i % 3 === 2 ? 'exercise' : 'theory',
              estimated_minutes: 30 + (i % 3) * 15,
              difficulty: Math.min(5, phaseData.targetLevel + 1) as 1 | 2 | 3 | 4 | 5,
              tags: [phaseData.title],
            });
          }
        }

        phaseStartDate = phaseEndDate;
      }
    }

    await supabase
      .from('profiles')
      .update({
        initial_level: level,
        current_level: level,
        onboarding_completed: true,
      })
      .eq('id', userId);

    return NextResponse.json({
      level,
      plan: planData,
      planId: plan?.id,
      message: '学習プランを作成しました',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({
      level: 1 as SkillLevel,
      plan: null,
      message: 'フォールバック: デモプランを使用します',
    });
  }
}
