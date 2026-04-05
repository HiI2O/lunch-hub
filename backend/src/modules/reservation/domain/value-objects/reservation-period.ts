/**
 * 予約可能期間を判定するユーティリティ値オブジェクト。
 * 予約可能範囲: 今日 〜 翌月末
 */
export class ReservationPeriod {
  /**
   * 指定日が予約可能期間内かどうかを判定する。
   * @param dateStr - 予約日 (YYYY-MM-DD)
   * @param now - 基準日時（テスト用にDI可能）
   */
  static isWithinPeriod(dateStr: string, now: Date = new Date()): boolean {
    const targetDate = new Date(dateStr + 'T00:00:00');

    // 今日の開始時刻（0:00）
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // 過去の日付は予約不可
    if (targetDate < todayStart) {
      return false;
    }

    // 翌月末を計算: 翌々月の0日 = 翌月末日
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    return targetDate <= endOfNextMonth;
  }
}
