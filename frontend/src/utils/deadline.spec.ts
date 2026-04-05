import { describe, it, expect } from 'vitest';
import { isBeforeDeadline } from './deadline';

/**
 * JST (UTC+9) の日時をDateオブジェクトとして生成する。
 */
function createJstDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
}

describe('isBeforeDeadline', () => {
  it('当日9:30より前なら操作可能（true）', () => {
    const now = createJstDate(2026, 4, 5, 9, 0);
    expect(isBeforeDeadline('2026-04-05', now)).toBe(true);
  });

  it('当日9:30ちょうどは締め切り後（false）', () => {
    const now = createJstDate(2026, 4, 5, 9, 30);
    expect(isBeforeDeadline('2026-04-05', now)).toBe(false);
  });

  it('当日9:30を過ぎていると締め切り後（false）', () => {
    const now = createJstDate(2026, 4, 5, 10, 0);
    expect(isBeforeDeadline('2026-04-05', now)).toBe(false);
  });

  it('翌日以降の予約は常に操作可能（true）', () => {
    const now = createJstDate(2026, 4, 5, 15, 0);
    expect(isBeforeDeadline('2026-04-06', now)).toBe(true);
  });

  it('過去の日付は常に締め切り後（false）', () => {
    const now = createJstDate(2026, 4, 5, 8, 0);
    expect(isBeforeDeadline('2026-04-04', now)).toBe(false);
  });
});
