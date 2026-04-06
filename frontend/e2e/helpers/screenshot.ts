import type { Page } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'e2e/screenshots';

/**
 * テストケースのステップごとにスクリーンショットを保存する。
 * ファイル名: {tcId}-{step}-{description}.png
 */
export async function takeEvidence(
  page: Page,
  tcId: string,
  step: number,
  description: string,
): Promise<void> {
  const fileName = `${tcId}-step${String(step).padStart(2, '0')}-${description}.png`;
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, fileName), fullPage: true });
}
