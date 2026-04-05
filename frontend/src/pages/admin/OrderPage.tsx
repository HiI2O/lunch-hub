import { useState, useEffect, useCallback } from 'react';
import type { OrderApi } from '../../api/order';
import type { OrderResult } from '../../api/types';

type OrderPageProps = {
  readonly orderApi: OrderApi;
};

export function OrderPage({ orderApi }: OrderPageProps) {
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const from = thirtyDaysAgo.toISOString().split('T')[0];
      const data = await orderApi.getOrders({ from, to: today });
      setOrders(data);
    } catch {
      setError('注文の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [orderApi, today]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const todayOrder = orders.find((o) => o.orderDate === today);

  const handlePlace = async (orderId: string): Promise<void> => {
    try {
      await orderApi.placeOrder(orderId);
      await loadOrders();
    } catch {
      setError('注文確定に失敗しました');
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
          <div className="stat-label">本日の注文数</div>
          <div className="stat-value">{todayOrder?.totalCount ?? 0}</div>
        </div>
      </div>

      {todayOrder && todayOrder.status === 'PENDING' && (
        <div className="card">
          <div className="flex-between mb-2">
            <h3 className="card-title mb-0">本日の注文（{today}）</h3>
            <div className="flex gap-1">
              <span className="badge badge-warning">未確定</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => void handlePlace(todayOrder.id)}
              >
                注文を確定
              </button>
            </div>
          </div>
          <p className="text-secondary text-sm">
            合計: {todayOrder.totalCount} 食
          </p>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">注文履歴</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>日付</th>
                <th>合計</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderDate}</td>
                  <td>{order.totalCount}</td>
                  <td>
                    {order.status === 'PLACED' ? (
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
