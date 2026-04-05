import { useState, useEffect, useCallback } from 'react';
import type { ReservationResult } from '../../api/types';
import type { ReservationApi } from '../../api/reservation';
import { isBeforeDeadline } from '../../utils/deadline';

type HistoryPageProps = {
  readonly reservationApi: ReservationApi;
};

export function HistoryPage({ reservationApi }: HistoryPageProps): React.JSX.Element {
  const [reservations, setReservations] = useState<readonly ReservationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchReservations = useCallback((): void => {
    setIsLoading(true);
    void reservationApi
      .getMyReservations()
      .then(setReservations)
      .finally(() => setIsLoading(false));
  }, [reservationApi]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancel = async (id: string): Promise<void> => {
    if (cancellingId) return;
    setCancellingId(id);
    try {
      await reservationApi.cancelReservation(id);
      fetchReservations();
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string): React.JSX.Element => {
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

  const formatPaymentMethod = (method: string): string => {
    return method === 'TICKET' ? 'チケット' : '現金';
  };

  // 統計計算
  const confirmedCount = reservations.filter((r) => r.status !== 'CANCELLED').length;
  const ticketCount = reservations.filter(
    (r) => r.status !== 'CANCELLED' && r.paymentMethod === 'TICKET',
  ).length;
  const cashCount = reservations.filter(
    (r) => r.status !== 'CANCELLED' && r.paymentMethod === 'CASH',
  ).length;

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">予約数</div>
          <div className="stat-value">{confirmedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">チケット使用</div>
          <div className="stat-value">{ticketCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">現金支払い</div>
          <div className="stat-value">{cashCount}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">予約履歴</h3>

        {reservations.length === 0 ? (
          <p className="text-secondary text-center">予約履歴がありません</p>
        ) : (
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
                {reservations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.reservationDate}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{formatPaymentMethod(item.paymentMethod)}</td>
                    <td className="text-secondary text-sm">{item.createdAt}</td>
                    <td>
                      {item.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => void handleCancel(item.id)}
                          disabled={cancellingId === item.id || !isBeforeDeadline(item.reservationDate)}
                        >
                          キャンセル
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
