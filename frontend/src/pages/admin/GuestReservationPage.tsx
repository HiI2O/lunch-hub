export function GuestReservationPage() {
  // モック用のゲスト予約データ
  const mockGuestReservations = [
    { id: '1', guestName: '佐藤様', date: '2026-01-21', createdBy: '山田 太郎', createdAt: '2026-01-20 15:30' },
    { id: '2', guestName: '田中様', date: '2026-01-21', createdBy: '山田 太郎', createdAt: '2026-01-20 16:00' },
    { id: '3', guestName: '鈴木様', date: '2026-01-20', createdBy: '佐藤 花子', createdAt: '2026-01-19 10:00' },
  ];

  return (
    <div>
      <div className="card">
        <h3 className="card-title">ゲスト予約を作成</h3>
        <p className="text-secondary text-sm mb-2">
          来客や外部の方のために弁当を代理予約できます。<br />
          ゲスト予約は現金払いのみとなります。
        </p>

        <form>
          <div className="form-group">
            <label className="form-label" htmlFor="guestName">
              ゲスト名
            </label>
            <input
              type="text"
              id="guestName"
              className="form-input"
              placeholder="例：佐藤様"
            />
            <p className="form-hint">識別用の名前を入力してください</p>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reservationDate">
              予約日
            </label>
            <input
              type="date"
              id="reservationDate"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              ゲスト予約を作成
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">ゲスト予約一覧</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ゲスト名</th>
                <th>予約日</th>
                <th>作成者</th>
                <th>作成日時</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {mockGuestReservations.map((item) => (
                <tr key={item.id}>
                  <td>{item.guestName}</td>
                  <td>{item.date}</td>
                  <td>{item.createdBy}</td>
                  <td className="text-secondary text-sm">{item.createdAt}</td>
                  <td>
                    <button className="btn btn-danger btn-sm">キャンセル</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
