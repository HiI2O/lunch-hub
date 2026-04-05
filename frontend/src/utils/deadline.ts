const DEADLINE_HOUR = 9;
const DEADLINE_MINUTE = 30;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 指定日の予約が締め切り前かどうかを判定する。
 * バックエンドの ReservationDeadlineService と同じロジック。
 *
 * - 当日 9:30 JST より前 → true（操作可能）
 * - 当日 9:30 JST 以降 → false（締切済）
 * - 翌日以降 → true
 * - 過去の日付 → false
 */
export function isBeforeDeadline(
  reservationDate: string,
  now: Date = new Date(),
): boolean {
  const jstNow = new Date(now.getTime() + JST_OFFSET_MS);
  const todayStr = jstNow.toISOString().slice(0, 10);

  if (reservationDate < todayStr) {
    return false;
  }

  if (reservationDate > todayStr) {
    return true;
  }

  const jstHour = jstNow.getUTCHours();
  const jstMinute = jstNow.getUTCMinutes();
  const jstTotalMinutes = jstHour * 60 + jstMinute;
  const deadlineTotalMinutes = DEADLINE_HOUR * 60 + DEADLINE_MINUTE;

  return jstTotalMinutes < deadlineTotalMinutes;
}
