import { Client } from '@notionhq/client';
import { LearningPlan, Milestone } from '@/types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export function createNotionClient(token: string) {
  return new Client({ auth: token });
}

// ===== Notion データベース作成 =====

export async function createNotionLearningDatabase(
  token: string,
  parentPageId: string,
  plan: LearningPlan
): Promise<string> {
  const notion = createNotionClient(token);

  const response = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [
      {
        type: 'text',
        text: { content: `PyReview Dojo - ${plan.title}` },
      },
    ],
    properties: {
      タスク名: { title: {} },
      ステータス: {
        select: {
          options: [
            { name: '未着手', color: 'gray' },
            { name: '進行中', color: 'blue' },
            { name: '完了', color: 'green' },
          ],
        },
      },
      種別: {
        select: {
          options: [
            { name: 'マイルストーン', color: 'red' },
            { name: 'レッスン', color: 'orange' },
            { name: '演習', color: 'yellow' },
          ],
        },
      },
      フェーズ: {
        select: {
          options: [
            { name: 'フェーズ1', color: 'purple' },
            { name: 'フェーズ2', color: 'blue' },
            { name: 'フェーズ3', color: 'green' },
            { name: 'フェーズ4', color: 'orange' },
            { name: 'フェーズ5', color: 'red' },
          ],
        },
      },
      期限: { date: {} },
      完了日: { date: {} },
      メモ: { rich_text: {} },
    },
  });

  return response.id;
}

// ===== マイルストーンをNotionにUpsert同期 =====
// 既存ページがあれば更新、なければ新規作成する

export async function syncMilestonesToNotion(
  token: string,
  databaseId: string,
  milestones: Milestone[],
  phaseNumber: number,
  currentMilestoneId?: string // 「進行中」として扱うマイルストーンID
): Promise<void> {
  const notion = createNotionClient(token);

  for (const milestone of milestones) {
    // Notionのステータスを決定
    let notionStatus: string;
    if (milestone.status === 'completed') {
      notionStatus = '完了';
    } else if (milestone.id === currentMilestoneId) {
      notionStatus = '進行中';
    } else {
      notionStatus = '未着手';
    }

    // 完了日プロパティの設定
    const completedDateProp = milestone.completed_at
      ? { 完了日: { date: { start: milestone.completed_at.split('T')[0] } } }
      : {};

    const properties = {
      タスク名: {
        title: [{ type: 'text' as const, text: { content: milestone.title } }],
      },
      ステータス: {
        select: { name: notionStatus },
      },
      種別: {
        select: { name: 'マイルストーン' },
      },
      フェーズ: {
        select: { name: `フェーズ${phaseNumber}` },
      },
      期限: {
        date: { start: milestone.due_date },
      },
      メモ: {
        rich_text: [
          {
            type: 'text' as const,
            text: { content: milestone.description || '' },
          },
        ],
      },
      ...completedDateProp,
    };

    // 既存ページを検索（タイトルで一致するものを探す）
    const existing = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'タスク名',
        title: { equals: milestone.title },
      },
    });

    if (existing.results.length > 0) {
      // 既存ページを更新
      await notion.pages.update({
        page_id: existing.results[0].id,
        properties,
      });
    } else {
      // 新規ページを作成
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      });
    }
  }
}

// ===== マイルストーンのステータスをNotionに同期 =====

export async function updateMilestoneInNotion(
  token: string,
  databaseId: string,
  milestoneTitle: string,
  completedAt: string,
  status: '完了' | '進行中' | '未着手' = '完了'
): Promise<void> {
  const notion = createNotionClient(token);

  // データベースからページを検索
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'タスク名',
      title: { equals: milestoneTitle },
    },
  });

  if (response.results.length > 0) {
    const pageId = response.results[0].id;
    const updateProps: Record<string, unknown> = {
      ステータス: {
        select: { name: status },
      },
    };

    // 完了時のみ完了日を設定
    if (status === '完了') {
      updateProps['完了日'] = {
        date: { start: completedAt.split('T')[0] },
      };
    }

    await notion.pages.update({
      page_id: pageId,
      properties: updateProps,
    });
  }
}

// ===== 学習計画の概要ページ作成 =====

export async function createPlanOverviewPage(
  token: string,
  parentPageId: string,
  plan: LearningPlan
): Promise<string> {
  const notion = createNotionClient(token);

  const startDate = format(parseISO(plan.start_date), 'yyyy年M月d日', { locale: ja });
  const endDate = format(parseISO(plan.end_date), 'yyyy年M月d日', { locale: ja });

  const response = await notion.pages.create({
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [
          { type: 'text', text: { content: `PyReview Dojo - 学習計画` } },
        ],
      },
    },
    children: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: plan.title } }],
        },
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: plan.description || '' } }],
        },
      },
      {
        type: 'callout',
        callout: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `学習期間: ${startDate} 〜 ${endDate}（${plan.total_weeks}週間）`,
              },
            },
          ],
          icon: { type: 'emoji', emoji: '📅' },
          color: 'blue_background',
        },
      },
      {
        type: 'divider',
        divider: {},
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'フェーズ概要' } }],
        },
      },
      ...plan.phases.map((phase) => ({
        type: 'bulleted_list_item' as const,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text' as const,
              text: {
                content: `フェーズ${phase.phase_number}: ${phase.title}（${phase.weeks}週間）`,
              },
            },
          ],
        },
      })),
    ],
  });

  return response.id;
}
