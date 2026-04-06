import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { takeEvidence } from './helpers/screenshot';
import { resetTestEnvironment } from './helpers/cleanup';

const TC = 'tc01';

test.describe('TC-01: 初回登録〜ログインフロー', () => {
  const testEmail = `e2e-tc01-${Date.now()}@company.com`;
  const testPassword = 'TestUser123!';
  const testDisplayName = 'TC01テストユーザー';

  test.beforeAll(async () => {
    await resetTestEnvironment();
  });

  test('招待→アクティベーション→ログインのフルフロー', async ({ page }) => {
    test.setTimeout(60000);

    // --- ステップ1: 管理者でログインし、ユーザー管理画面を開く ---
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await expect(page.getByText('ユーザー一覧')).toBeVisible();
    // エビデンス: ユーザー管理画面が表示されている（初期状態）
    await takeEvidence(page, TC, 1, 'user-management-initial');

    // --- ステップ2: 招待フォームにメールアドレスを入力して送信 ---
    await page.getByPlaceholder('email@company.com').fill(testEmail);
    await page.getByRole('button', { name: '招待を送信' }).click();

    // エビデンス: 一覧に「招待中」ステータスのユーザーが追加された
    await expect(page.getByText(testEmail)).toBeVisible({ timeout: 10000 });
    // 招待中バッジが表示されていることを確認
    const userRow = page.locator('tr', { has: page.getByText(testEmail) });
    await expect(userRow.getByText('招待中')).toBeVisible();
    await takeEvidence(page, TC, 2, 'user-invited-in-list');

    // --- ステップ3: MailHogで招待メールを確認 ---
    await page.waitForTimeout(1000);
    const mailhogResponse = await page.request.get(
      'http://localhost:8025/api/v2/search?kind=to&query=' + encodeURIComponent(testEmail),
    );
    const mailData = (await mailhogResponse.json()) as {
      items: Array<{ Content: { Body: string } }>;
    };
    expect(mailData.items.length).toBeGreaterThan(0);

    // MailHog画面をブラウザで開いてエビデンスを撮る
    await page.goto('http://localhost:8025');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(1000);
    await takeEvidence(page, TC, 3, 'mailhog-email-received');

    // メール本文からアクティベーションリンクを取得
    const rawBody = mailData.items[0].Content.Body;
    const decodedBody = rawBody.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
    const activateUrlMatch = decodedBody.match(/https?:\/\/[^\s"<]+activate[^\s"<]*/);
    expect(activateUrlMatch).not.toBeNull();

    // --- ステップ4: アクティベーションリンクをクリック ---
    const activateUrl = activateUrlMatch![0];
    await page.goto(activateUrl);
    // エビデンス: アクティベーション画面が表示された
    await expect(page.getByText('アカウント有効化')).toBeVisible();
    await takeEvidence(page, TC, 4, 'activation-page-displayed');

    // --- ステップ5: 表示名・パスワードを入力して送信 →カレンダーにリダイレクト ---
    await page.getByLabel('表示名').fill(testDisplayName);
    await page.getByLabel('パスワード', { exact: true }).fill(testPassword);
    await page.getByLabel('パスワード（確認）').fill(testPassword);
    // エビデンス: フォーム入力完了の状態（送信直前）
    await takeEvidence(page, TC, 5, 'activation-form-filled');

    await page.getByRole('button', { name: 'アカウントを有効化' }).click();
    await expect(page).toHaveURL(/\/calendar/, { timeout: 10000 });
    // エビデンス: カレンダー画面にリダイレクトされた（ログイン状態）
    await takeEvidence(page, TC, 6, 'activated-calendar-shown');

    // --- ステップ6: ログアウト ---
    await page.getByRole('button', { name: 'ログアウト' }).click();
    await expect(page).toHaveURL(/\/login/);
    // エビデンス: ログイン画面に戻った
    await takeEvidence(page, TC, 7, 'logged-out-to-login');

    // --- ステップ7: 先ほどのメール/パスワードでログイン ---
    await page.getByLabel('メールアドレス').fill(testEmail);
    await page.getByLabel('パスワード').fill(testPassword);
    // エビデンス: ログインフォームに入力済み（送信直前）
    await takeEvidence(page, TC, 8, 'login-form-filled');

    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page).toHaveURL(/\/calendar/, { timeout: 10000 });
    // エビデンス: 再ログイン成功、カレンダー画面表示
    await takeEvidence(page, TC, 9, 'relogin-calendar-shown');
  });
});
