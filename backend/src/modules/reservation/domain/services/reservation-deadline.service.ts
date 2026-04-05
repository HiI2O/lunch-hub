const DEADLINE_HOUR = 9;
const DEADLINE_MINUTE = 30;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 予約締め切り（当日9:30 JST）を管理するドメインサービス。
 */
export class ReservationDeadlineService {
  /**
   * 指定日の予約が締め切り前かどうかを判定する。
   * - 当日の場合: 現在時刻が9:30 JSTより前ならtrue
   * - 翌日以降の場合: 常にtrue
   * - 過去の日付: 常にfalse
   *
   * @param reservationDate - 予約日 (YYYY-MM-DD)
   * @param now - 基準日時（テスト用にDI可能）
   */
  static isBeforeDeadline(
    reservationDate: string,
    now: Date = new Date(),
  ): boolean {
    // JSTでの「今日」の日付文字列を取得
    const jstNow = new Date(now.getTime() + JST_OFFSET_MS);
    const todayStr = jstNow.toISOString().slice(0, 10);

    if (reservationDate < todayStr) {
      // 過去の日付
      return false;
    }

    if (reservationDate > todayStr) {
      // 翌日以降
      return true;
    }

    // 当日: JSTでの時刻が9:30より前かチェック
    const jstHour = jstNow.getUTCHours();
    const jstMinute = jstNow.getUTCMinutes();
    const jstTotalMinutes = jstHour * 60 + jstMinute;
    const deadlineTotalMinutes = DEADLINE_HOUR * 60 + DEADLINE_MINUTE;

    return jstTotalMinutes < deadlineTotalMinutes;
  }
}
