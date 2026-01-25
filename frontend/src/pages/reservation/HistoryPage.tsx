export function HistoryPage() {
  // モック用の予約履歴データ
  const mockHistory = [
    { id: '1', date: '2026-01-20', status: 'CONFIRMED', payment: 'チケット', createdAt: '2026-01-18 10:30' },
    { id: '2', date: '2026-01-17', status: 'FINALIZED', payment: '現金', createdAt: '2026-01-15 09:00' },
    { id: '3', date: '2026-01-15', status: 'CANCELLED', payment: 'チケット', createdAt: '2026-01-14 14:20' },
    { id: '4', date: '2026-01-10', status: 'FINALIZED', payment: 'チケット', createdAt: '2026-01-08 11:45' },
    { id: '5', date: '2026-01-08', status: 'FINALIZED', payment: '現金', createdAt: '2026-01-06 16:00' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success">予約済</span>;
      case 'FINALIZED':
        return <span className="badge badge-info">確定</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">キャンセル</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">今月の予約数</div>
          <div className="stat-value">12</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">チケット使用</div>
          <div className="stat-value">8</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">現金支払い</div>
          <div className="stat-value">4</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">予約履歴</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>予約日</th>
                <th>ステータス</th>
                <th>支払方法</th>
                <th>予約日時</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {mockHistory.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{item.payment}</td>
                  <td className="text-secondary text-sm">{item.createdAt}</td>
                  <td>
                    {item.status === 'CONFIRMED' && (
                      <button className="btn btn-danger btn-sm">キャンセル</button>
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
