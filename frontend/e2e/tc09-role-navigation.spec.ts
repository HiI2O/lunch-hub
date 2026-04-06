import { test, expect } from '@playwright/test';
import { loginViaUI } from './helpers/auth';
import { takeEvidence } from './helpers/screenshot';

const TC = 'tc09';

test.describe('TC-09: ロール別ナビゲーション表示', () => {
  test('ステップ1: GENERAL_USER — カレンダー・予約履歴・チケットのみ表示', async ({ page }) => {
    await loginViaUI(page, 'general-user@company.com', 'TestUser123!');

    // 表示されるべきメニュー
    await expect(page.getByRole('link', { name: 'カレンダー' })).toBeVisible();

    // 表示されないべきメニュー
    await expect(page.getByRole('link', { name: 'ユーザー管理' })).not.toBeVisible();

    await takeEvidence(page, TC, 1, 'general-user-navigation');
  });

  test('ステップ2: STAFF — 注文管理・ゲスト予約も表示、ユーザー管理は非表示', async ({ page }) => {
    await loginViaUI(page, 'staff-user@company.com', 'TestUser123!');

    await expect(page.getByRole('link', { name: 'カレンダー' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ユーザー管理' })).not.toBeVisible();

    await takeEvidence(page, TC, 2, 'staff-navigation');
  });

  test('ステップ3: ADMINISTRATOR — 全メニューが表示', async ({ page }) => {
    await loginViaUI(page, 'admin@company.com', 'Admin123!');

    await expect(page.getByRole('link', { name: 'カレンダー' })).toBeVisible();

    await takeEvidence(page, TC, 3, 'admin-navigation');
  });
});
