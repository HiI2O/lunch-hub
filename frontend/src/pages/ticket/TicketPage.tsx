export function TicketPage() {
  // モック用のチケットデータ
  const mockTickets = [
    { id: '1', balance: 7, status: 'RECEIVED', purchasedAt: '2026-01-10' },
    { id: '2', balance: 0, status: 'RECEIVED', purchasedAt: '2025-12-15' },
  ];

  const mockPurchaseHistory = [
    { id: '1', setCount: 1, status: 'RECEIVED', requestedAt: '2026-01-10 09:00', receivedAt: '2026-01-10 12:30' },
    { id: '2', setCount: 1, status: 'PENDING', requestedAt: '2026-01-20 10:15', receivedAt: null },
    { id: '3', setCount: 1, status: 'RECEIVED', requestedAt: '2025-12-15 14:00', receivedAt: '2025-12-15 17:00' },
  ];

  const totalBalance = mockTickets.reduce((sum, t) => sum + t.balance, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return <span className="badge badge-success">受取済</span>;
      case 'PENDING':
        return <span className="badge badge-warning">受取待ち</span>;
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
          <div className="stat-label">チケット残高</div>
          <div className="stat-value success">{totalBalance} 枚</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">受取待ち</div>
          <div className="stat-value warning">1 セット</div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-2">
          <h3 className="card-title mb-0">チケット購入</h3>
          <button className="btn btn-primary btn-sm">購入予約する</button>
        </div>
        <p className="text-secondary text-sm">
          チケットは10枚1セットで購入できます。<br />
          購入予約後、係の方から受け取ってください。
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">購入履歴</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>セット数</th>
                <th>ステータス</th>
                <th>申請日時</th>
                <th>受取日時</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {mockPurchaseHistory.map((item) => (
                <tr key={item.id}>
                  <td>{item.setCount} セット（10枚）</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-secondary text-sm">{item.requestedAt}</td>
                  <td className="text-secondary text-sm">{item.receivedAt || '-'}</td>
                  <td>
                    {item.status === 'PENDING' && (
                      <button className="btn btn-danger btn-sm">キャンセル</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">チケット詳細</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>チケットID</th>
                <th>残高</th>
                <th>ステータス</th>
                <th>購入日</th>
              </tr>
            </thead>
            <tbody>
              {mockTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="text-secondary text-sm">#{ticket.id}</td>
                  <td>{ticket.balance} 枚</td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td className="text-secondary text-sm">{ticket.purchasedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
