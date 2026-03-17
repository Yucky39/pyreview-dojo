import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  /* テスト実行の最大タイムアウト */
  timeout: 30_000,
  /* テストファイルの並列実行 */
  fullyParallel: true,
  /* CI環境ではリトライを有効化 */
  retries: process.env.CI ? 2 : 0,
  /* CI環境ではワーカー数を制限 */
  workers: process.env.CI ? 1 : undefined,
  /* レポーター設定 */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  /* 全テスト共通の設定 */
  use: {
    baseURL: 'http://localhost:3000',
    /* テスト失敗時にスクリーンショットを保存 */
    screenshot: 'only-on-failure',
    /* テスト失敗時にトレースを記録 */
    trace: 'on-first-retry',
  },
  /* ブラウザ別のプロジェクト設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* モバイル端末テスト */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  /* 開発サーバーを自動起動 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
