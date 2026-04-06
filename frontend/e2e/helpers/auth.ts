import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * ブラウザ操作でログインする。
 * 認証トークンはアプリ側がメモリで管理するため、UI経由でログインする。
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('メールアドレス').fill(email);
  await page.getByLabel('パスワード').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page).toHaveURL(/\/calendar/, { timeout: 10000 });
}

/**
 * 管理者としてログインする。
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await loginViaUI(page, 'admin@company.com', 'Admin123!');
}
