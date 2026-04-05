import { useState, useEffect, useCallback } from 'react';
import type { CalendarData, ReservationResult } from '../../api/types';
import type { ReservationApi } from '../../api/reservation';
import { isBeforeDeadline } from '../../utils/deadline';

type CalendarPageProps = {
  readonly reservationApi: ReservationApi;
};

type SelectedDay = {
  readonly dateStr: string;
  readonly dayNum: number;
  readonly hasReservation: boolean;
  readonly reservation?: ReservationResult;
};

export function CalendarPage({ reservationApi }: CalendarPageProps): React.JSX.Element {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [reservations, setReservations] = useState<readonly ReservationResult[]>([]);
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TICKET'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

  const fetchData = useCallback((): void => {
    void reservationApi.getCalendarData(year, month + 1).then(setCalendarData);
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    void reservationApi.getMyReservations({ from, to }).then(setReservations);
  }, [reservationApi, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPrevMonth = (): void => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = (): void => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // カレンダー日付の生成
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays: Date[] = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const handleDayClick = (date: Date): void => {
    if (!isCurrentMonth(date)) return;

    const dateStr = formatDateKey(date);
    const dayData = calendarData[dateStr];
    const hasReservation = dayData?.hasReservation ?? false;
    const reservation = reservations.find((r) => r.reservationDate === dateStr);

    setSelectedDay({
      dateStr,
      dayNum: date.getDate(),
      hasReservation,
      reservation: reservation ?? undefined,
    });
    setPaymentMethod('CASH');
  };

  const handleCreateReservation = async (): Promise<void> => {
    if (!selectedDay || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await reservationApi.createReservation({
        reservationDate: selectedDay.dateStr,
        paymentMethod,
      });
      setSelectedDay(null);
      fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = async (): Promise<void> => {
    if (!selectedDay?.reservation || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await reservationApi.cancelReservation(selectedDay.reservation.id);
      setSelectedDay(null);
      fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="calendar-nav">
          <button
            className="btn btn-outline btn-sm"
            onClick={goToPrevMonth}
          >
            &lt; 前月
          </button>
          <span className="calendar-month">
            {year}年 {month + 1}月
          </span>
          <button
            className="btn btn-outline btn-sm"
            onClick={goToNextMonth}
          >
            翌月 &gt;
          </button>
        </div>

        <div className="calendar-grid">
          {daysOfWeek.map((day) => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            const dateKey = formatDateKey(date);
            const dayData = calendarData[dateKey];
            const hasReservation = dayData?.hasReservation ?? false;
            const status = dayData?.status;
            const classNames = [
              'calendar-day',
              !isCurrentMonth(date) ? 'other-month' : '',
              isToday(date) ? 'today' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={index}
                type="button"
                className={classNames}
                onClick={() => handleDayClick(date)}
                disabled={!isCurrentMonth(date)}
                aria-label={String(date.getDate())}
              >
                <div className="calendar-day-number">{date.getDate()}</div>
                <div className="calendar-day-content">
                  {hasReservation && status && (
                    <span
                      className={`reservation-badge ${status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`}
                      title={status === 'CONFIRMED' ? '予約済' : 'キャンセル'}
                    >
                      {status === 'CONFIRMED' ? '✓' : '×'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 予約の凡例 */}
      <div className="card mt-2">
        <h3 className="card-title">予約の見方</h3>
        <p className="text-secondary text-sm text-center mb-2">
          日付をタップすると詳細・予約変更ができます。
        </p>
        <div className="flex justify-center align-center gap-4">
          <div className="flex align-center gap-2">
            <span className="reservation-badge confirmed">✓</span>
            <span className="text-sm font-bold">予約済</span>
          </div>
          <div className="flex align-center gap-2">
            <span className="reservation-badge cancelled">×</span>
            <span className="text-sm font-bold">キャンセル</span>
          </div>
        </div>
      </div>

      {/* 予約ダイアログ */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title">
              {month + 1}月{selectedDay.dayNum}日
              {!isBeforeDeadline(selectedDay.dateStr) && (
                <span className="badge badge-danger ml-1">締切済</span>
              )}
            </h3>

            {selectedDay.hasReservation && selectedDay.reservation ? (
              // 予約済み: 詳細表示 + キャンセル
              <div>
                <p className="mb-1">
                  ステータス:{' '}
                  <span className="badge badge-success">
                    {selectedDay.reservation.status === 'CONFIRMED'
                      ? '予約済'
                      : selectedDay.reservation.status}
                  </span>
                </p>
                <p className="mb-2">
                  支払方法:{' '}
                  {selectedDay.reservation.paymentMethod === 'CASH'
                    ? '現金'
                    : 'チケット'}
                </p>
                {selectedDay.reservation.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => void handleCancelReservation()}
                    disabled={isSubmitting || !isBeforeDeadline(selectedDay.dateStr)}
                  >
                    キャンセル
                  </button>
                )}
              </div>
            ) : (
              // 未予約: 作成フォーム
              <div>
                <div className="form-group">
                  <label className="form-label">支払方法</label>
                  <div className="flex gap-4">
                    <label className="flex align-center gap-1">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH"
                        checked={paymentMethod === 'CASH'}
                        onChange={() => setPaymentMethod('CASH')}
                      />
                      現金
                    </label>
                    <label className="flex align-center gap-1">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="TICKET"
                        checked={paymentMethod === 'TICKET'}
                        onChange={() => setPaymentMethod('TICKET')}
                      />
                      チケット
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleCreateReservation()}
                  disabled={isSubmitting || !isBeforeDeadline(selectedDay.dateStr)}
                >
                  予約する
                </button>
              </div>
            )}

            <button
              type="button"
              className="btn btn-outline mt-2"
              onClick={() => setSelectedDay(null)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
