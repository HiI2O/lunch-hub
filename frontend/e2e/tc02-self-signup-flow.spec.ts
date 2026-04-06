import { test, expect } from '@playwright/test';
import { takeEvidence } from './helpers/screenshot';

const TC = 'tc02';

test.describe('TC-02: セルフサインアップフロー', () => {
  const testEmail = `e2e-tc02-${Date.now()}@company.com`;
  const testPassword = 'TestUser123!';
  const testDisplayName = 'TC02テストユーザー';

  test('PIN登録→メール確認→アクティベーション→カレンダー表示', async ({ page }) => {
    // --- ステップ1: ログイン画面で「新規登録はこちら」をクリック ---
    await page.goto('/login');
    await page.getByRole('link', { name: '新規登録はこちら' }).click();
    await expect(page).toHaveURL(/\/signup/);
    await takeEvidence(page, TC, 1, 'signup-page');

    // --- ステップ2: メールアドレスとPINを入力して送信 ---
    await page.getByLabel('メールアドレス').fill(testEmail);
    await page.getByLabel('社員用PIN').fill('LUNCH2024');

    await page.getByRole('button', { name: '登録申請' }).click();
    await expect(page.getByText('招待メールを送信しました')).toBeVisible();
    await takeEvidence(page, TC, 2, 'signup-success-message');

    // --- ステップ3: MailHogで招待メールを確認→リンクをクリック ---
    // メール配信に少し時間がかかる場合があるので待つ
    await page.waitForTimeout(1000);

    const mailhogResponse = await page.request.get(
      'http://localhost:8025/api/v2/search?kind=to&query=' + encodeURIComponent(testEmail),
    );
    const mailData = (await mailhogResponse.json()) as {
      items: Array<{ Content: { Body: string } }>;
    };
    expect(mailData.items.length).toBeGreaterThan(0);

    const rawBody = mailData.items[0].Content.Body;
    const decodedBody = rawBody.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
    const activateUrlMatch = decodedBody.match(/https?:\/\/[^\s"<]+activate[^\s"<]*/);
    expect(activateUrlMatch).not.toBeNull();

    await page.goto(activateUrlMatch![0]);
    await expect(page.getByText('アカウント有効化')).toBeVisible();
    await takeEvidence(page, TC, 3, 'activation-page');

    // --- ステップ4: 表示名・パスワードを入力して送信 ---
    await page.getByLabel('表示名').fill(testDisplayName);
    await page.getByLabel('パスワード', { exact: true }).fill(testPassword);
    await page.getByLabel('パスワード（確認）').fill(testPassword);
    await page.getByRole('button', { name: 'アカウントを有効化' }).click();

    await expect(page).toHaveURL(/\/calendar/, { timeout: 10000 });
    await takeEvidence(page, TC, 4, 'activated-redirected-to-calendar');
  });
});
