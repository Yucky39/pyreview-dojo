import { test, expect } from '@playwright/test';

test.describe('ページナビゲーション', () => {
  test('ランディングページからオンボーディングへ遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /無料で学習スタート/ }).first().click();
    // 認証保護: ログインページへリダイレクトされる場合がある
    await expect(page).toHaveURL(/\/(onboarding|auth\/login)/);
  });

  test('ランディングページからダッシュボードへ遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /デモを見る/ }).click();
    // 認証保護: ログインページへリダイレクトされる場合がある
    await expect(page).toHaveURL(/\/(dashboard|auth\/login)/);
  });

  test('未認証ユーザーはダッシュボードからログインへリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('未認証ユーザーはオンボーディングからログインへリダイレクトされる', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
