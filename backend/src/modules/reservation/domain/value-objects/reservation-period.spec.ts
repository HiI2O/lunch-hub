import { ReservationPeriod } from './reservation-period.js';

describe('ReservationPeriod', () => {
  describe('isWithinPeriod', () => {
    it('今日の日付は予約可能期間内', () => {
      const today = new Date();
      const dateStr = formatDate(today);
      expect(ReservationPeriod.isWithinPeriod(dateStr, today)).toBe(true);
    });

    it('翌月末の日付は予約可能期間内', () => {
      const today = new Date(2026, 3, 5); // 2026-04-05
      // 翌月末 = 2026-05-31
      expect(ReservationPeriod.isWithinPeriod('2026-05-31', today)).toBe(true);
    });

    it('翌々月の日付は予約可能期間外', () => {
      const today = new Date(2026, 3, 5); // 2026-04-05
      // 翌々月 = 2026-06-01
      expect(ReservationPeriod.isWithinPeriod('2026-06-01', today)).toBe(false);
    });

    it('過去の日付は予約可能期間外', () => {
      const today = new Date(2026, 3, 5); // 2026-04-05
      expect(ReservationPeriod.isWithinPeriod('2026-04-04', today)).toBe(false);
    });

    it('月末の場合、翌月末まで予約可能', () => {
      const today = new Date(2026, 0, 31); // 2026-01-31
      // 翌月末 = 2026-02-28
      expect(ReservationPeriod.isWithinPeriod('2026-02-28', today)).toBe(true);
      expect(ReservationPeriod.isWithinPeriod('2026-03-01', today)).toBe(false);
    });
  });
});

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
