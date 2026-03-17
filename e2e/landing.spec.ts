import { test, expect } from '@playwright/test';

test.describe('ランディングページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページタイトルが表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/PyReview/);
  });

  test('ヒーローセクションが正しく表示される', async ({ page }) => {
    // メインヘッドライン
    await expect(page.getByText('Pythonコードレビューの')).toBeVisible();
    await expect(page.getByText('プロになろう')).toBeVisible();

    // CTAボタン
    const ctaButton = page.getByRole('link', { name: /無料で学習スタート/ }).first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/onboarding');
  });

  test('ナビゲーションバーにロゴが表示される', async ({ page }) => {
    await expect(page.locator('nav').getByText('PyReview Dojo')).toBeVisible();
  });

  test('特徴セクションに6つの機能が表示される', async ({ page }) => {
    await expect(page.getByText('PyReview Dojoの特徴')).toBeVisible();
    await expect(page.getByText('スキル診断&カスタムプラン')).toBeVisible();
    await expect(page.getByText('AIコードレビュー')).toBeVisible();
    await expect(page.getByText('Notion / Google Calendar連携')).toBeVisible();
    await expect(page.getByText('レベル認定証')).toBeVisible();
    await expect(page.getByText('進捗ダッシュボード')).toBeVisible();
    await expect(page.getByText('日本語ネイティブUI')).toBeVisible();
  });

  test('学習フローのステップが4つ表示される', async ({ page }) => {
    await expect(page.getByText('学習の流れ')).toBeVisible();
    await expect(page.getByText('STEP 01')).toBeVisible();
    await expect(page.getByText('STEP 02')).toBeVisible();
    await expect(page.getByText('STEP 03')).toBeVisible();
    await expect(page.getByText('STEP 04')).toBeVisible();
  });

  test('スキルレベルバッジが全レベル表示される', async ({ page }) => {
    const levels = ['完全初学者', '他言語経験者', 'Python入門', 'Python基礎', 'Python中級', 'コードレビュー'];
    for (const level of levels) {
      await expect(page.getByText(level, { exact: true })).toBeVisible();
    }
  });

  test('「無料で学習スタート」リンクをクリックすると遷移する', async ({ page }) => {
    const ctaButton = page.getByRole('link', { name: /無料で学習スタート/ }).first();
    await ctaButton.click();
    // 認証が必要な場合はログインページにリダイレクトされる
    await expect(page).toHaveURL(/\/(onboarding|auth\/login)/);
  });

  test('フッターが表示される', async ({ page }) => {
    await expect(page.getByText('© 2026 PyReview Dojo')).toBeVisible();
  });
});
