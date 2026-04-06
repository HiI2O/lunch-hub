import { test, expect } from '@playwright/test';
import { takeEvidence } from './helpers/screenshot';

const TC = 'tc10';

test.describe('TC-10: 未認証アクセスのリダイレクト', () => {
  test('ステップ1: 未認証で /calendar にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page).toHaveURL(/\/login/);
    await takeEvidence(page, TC, 1, 'calendar-redirected-to-login');
  });

  test('ステップ2: 未認証で /admin/users にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login/);
    await takeEvidence(page, TC, 2, 'admin-users-redirected-to-login');
  });

  test('ステップ3: 未認証で /admin/orders にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/\/login/);
    await takeEvidence(page, TC, 3, 'admin-orders-redirected-to-login');
  });

  test('ステップ4: 未認証で /tickets にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page).toHaveURL(/\/login/);
    await takeEvidence(page, TC, 4, 'tickets-redirected-to-login');
  });
});
