import { google } from 'googleapis';
import { LearningPlan, Milestone, LearningPhase } from '@/types';
import { addDays, parseISO } from 'date-fns';

// ===== Google OAuth2 クライアント =====

export function createGoogleAuthClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

// ===== カレンダーへのイベント追加 =====

export async function syncPlanToGoogleCalendar(
  accessToken: string,
  calendarId: string,
  plan: LearningPlan,
  phases: LearningPhase[]
): Promise<void> {
  const auth = createGoogleAuthClient(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  // フェーズ開始イベント
  for (const phase of phases) {
    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `[PyReview Dojo] フェーズ${phase.phase_number}開始: ${phase.title}`,
        description: phase.description || '',
        start: { date: phase.start_date },
        end: { date: phase.start_date },
        colorId: '1', // ラベンダー
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 60 }],
        },
      },
    });

    // マイルストーンイベント
    for (const milestone of phase.milestones) {
      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `[PyReview Dojo] マイルストーン: ${milestone.title}`,
          description: milestone.description || '',
          start: { date: milestone.due_date },
          end: { date: milestone.due_date },
          colorId: '11', // 赤
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 60 * 24 * 2 }, // 2日前
              { method: 'popup', minutes: 60 * 2 }, // 2時間前
            ],
          },
        },
      });
    }
  }

  // 学習終了イベント
  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `[PyReview Dojo] 学習完了目標: ${plan.title}`,
      description: '学習プランの完了目標日です。おめでとうございます！',
      start: { date: plan.end_date },
      end: { date: plan.end_date },
      colorId: '10', // 緑
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 * 24 * 7 }, // 1週間前
          { method: 'popup', minutes: 60 * 24 }, // 1日前
        ],
      },
    },
  });
}

// ===== マイルストーン完了イベントの追加 =====

export async function addMilestoneCompletedEvent(
  accessToken: string,
  calendarId: string,
  milestone: Milestone,
  completedAt: string
): Promise<void> {
  const auth = createGoogleAuthClient(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const dateStr = completedAt.split('T')[0];
  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `[PyReview Dojo] 達成! ${milestone.title}`,
      description: `${milestone.description}\n\n達成おめでとうございます！`,
      start: { date: dateStr },
      end: { date: dateStr },
      colorId: '10', // 緑
    },
  });
}

// ===== Google カレンダー一覧取得 =====

export async function listGoogleCalendars(
  accessToken: string
): Promise<Array<{ id: string; summary: string }>> {
  const auth = createGoogleAuthClient(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.calendarList.list();
  return (response.data.items || []).map((item) => ({
    id: item.id || '',
    summary: item.summary || '',
  }));
}

// ===== 週次学習リマインダーの設定 =====

export async function createWeeklyStudyReminders(
  accessToken: string,
  calendarId: string,
  startDate: string,
  endDate: string,
  hoursPerWeek: number
): Promise<void> {
  const auth = createGoogleAuthClient(accessToken);
  const calendar = google.calendar({ version: 'v3', auth });

  let current = parseISO(startDate);
  const end = parseISO(endDate);

  while (current <= end) {
    // 毎週月曜日に学習リマインダーを設定
    const dateStr = current.toISOString().split('T')[0];
    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `[PyReview Dojo] 今週の学習 (${hoursPerWeek}時間目標)`,
        start: { date: dateStr },
        end: { date: dateStr },
        colorId: '5', // バナナ
        recurrence: [],
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 480 }], // 8時間前
        },
      },
    });

    // 次の月曜日へ
    current = addDays(current, 7);
  }
}
