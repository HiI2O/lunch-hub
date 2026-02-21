export function CalendarPage() {
  // モック用の日付データ
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

  // 月の最初の日
  const firstDay = new Date(year, month, 1);

  // カレンダーの開始日（前月の日も含む）
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 6週間分の日付を生成
  const calendarDays: Date[] = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // モック用の予約データ
  const mockReservations: Record<string, { status: string; payment: string }> = {
    [`${year}-${String(month + 1).padStart(2, '0')}-10`]: { status: 'confirmed', payment: 'チケット' },
    [`${year}-${String(month + 1).padStart(2, '0')}-15`]: { status: 'confirmed', payment: '現金' },
    [`${year}-${String(month + 1).padStart(2, '0')}-20`]: { status: 'cancelled', payment: 'チケット' },
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <div>
      <div className="card">
        <div className="calendar-nav">
          <button className="btn btn-outline btn-sm">&lt; 前月</button>
          <span className="calendar-month">{year}年 {month + 1}月</span>
          <button className="btn btn-outline btn-sm">翌月 &gt;</button>
        </div>

        <div className="calendar-grid">
          {daysOfWeek.map((day) => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            const dateKey = formatDateKey(date);
            const reservation = mockReservations[dateKey];
            const classNames = [
              'calendar-day',
              !isCurrentMonth(date) ? 'other-month' : '',
              isToday(date) ? 'today' : '',
            ].filter(Boolean).join(' ');

            return (
              <div key={index} className={classNames}>
                <div className="calendar-day-number">{date.getDate()}</div>
                <div className="calendar-day-content">
                  {reservation && (
                    <span className={`reservation-badge ${reservation.status}`} title={reservation.status === 'confirmed' ? '予約済' : 'キャンセル'}>
                      {reservation.status === 'confirmed' ? '✓' : '×'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
    </div>
  );
}
