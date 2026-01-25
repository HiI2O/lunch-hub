export function OrderPage() {
  // モック用のデータ
  const today = new Date().toISOString().split('T')[0];

  const mockDailyOrders = [
    { date: today, total: 25, cash: 10, ticket: 12, guest: 3, status: 'PENDING' },
    { date: '2026-01-20', total: 30, cash: 12, ticket: 15, guest: 3, status: 'FINALIZED' },
    { date: '2026-01-17', total: 28, cash: 8, ticket: 18, guest: 2, status: 'FINALIZED' },
  ];

  const mockTodayReservations = [
    { id: '1', userName: '山田 太郎', payment: 'チケット', status: 'CONFIRMED' },
    { id: '2', userName: '佐藤 花子', payment: '現金', status: 'CONFIRMED' },
    { id: '3', userName: '鈴木 一郎', payment: 'チケット', status: 'CONFIRMED' },
    { id: '4', userName: '田中 美咲', payment: 'チケット', status: 'CONFIRMED' },
    { id: '5', userName: 'ゲスト（佐藤様）', payment: '現金', status: 'CONFIRMED' },
  ];

  const todayOrder = mockDailyOrders[0];

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">本日の注文数</div>
          <div className="stat-value">{todayOrder.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">現金</div>
          <div className="stat-value">{todayOrder.cash}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">チケット</div>
          <div className="stat-value">{todayOrder.ticket}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ゲスト</div>
          <div className="stat-value">{todayOrder.guest}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-2">
          <h3 className="card-title mb-0">本日の注文（{today}）</h3>
          <div className="flex gap-1">
            <span className="badge badge-warning">締切前</span>
            <button className="btn btn-primary btn-sm">注文を確定</button>
          </div>
        </div>
        <p className="text-secondary text-sm mb-2">
          締切時刻: 09:30（自動確定）
        </p>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ユーザー</th>
                <th>支払方法</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {mockTodayReservations.map((item) => (
                <tr key={item.id}>
                  <td>{item.userName}</td>
                  <td>{item.payment}</td>
                  <td><span className="badge badge-success">確認済</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">注文履歴</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>日付</th>
                <th>合計</th>
                <th>現金</th>
                <th>チケット</th>
                <th>ゲスト</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {mockDailyOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.date}</td>
                  <td>{order.total}</td>
                  <td>{order.cash}</td>
                  <td>{order.ticket}</td>
                  <td>{order.guest}</td>
                  <td>
                    {order.status === 'FINALIZED' ? (
                      <span className="badge badge-success">確定済</span>
                    ) : (
                      <span className="badge badge-warning">未確定</span>
                    )}
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
