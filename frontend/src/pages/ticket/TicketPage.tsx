import { useState, useEffect, useCallback } from 'react';
import type { TicketApi } from '../../api/ticket';
import type { TicketResult } from '../../api/types';

type TicketPageProps = {
  readonly ticketApi: TicketApi;
};

export function TicketPage({ ticketApi }: TicketPageProps) {
  const [tickets, setTickets] = useState<TicketResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketApi.getMyTickets();
      setTickets(data);
    } catch {
      setError('チケットの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [ticketApi]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const totalBalance = tickets.reduce((sum, t) => sum + t.remainingCount, 0);
  const pendingCount = tickets.filter((t) => t.status === 'PENDING').length;

  const handlePurchase = async (): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await ticketApi.createPurchaseReservation({
        purchaseDate: today,
        quantity: 1,
      });
      await loadTickets();
    } catch {
      setError('購入予約に失敗しました');
    }
  };

  const getStatusBadge = (status: string): JSX.Element => {
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

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">チケット残高</div>
          <div className="stat-value success">{totalBalance} 枚</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">受取待ち</div>
          <div className="stat-value warning">{pendingCount} セット</div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-2">
          <h3 className="card-title mb-0">チケット購入</h3>
          <button className="btn btn-primary btn-sm" onClick={() => void handlePurchase()}>
            購入予約する
          </button>
        </div>
        <p className="text-secondary text-sm">
          チケットは10枚1セットで購入できます。<br />
          購入予約後、係の方から受け取ってください。
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">チケット詳細</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>残高</th>
                <th>ステータス</th>
                <th>購入日</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.remainingCount} 枚</td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td className="text-secondary text-sm">{ticket.purchaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
