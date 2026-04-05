import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderPage } from './OrderPage';
import type { OrderApi } from '../../api/order';
import type { OrderResult } from '../../api/types';

const today = new Date().toISOString().split('T')[0];

const mockOrders: OrderResult[] = [
  { id: 'o1', orderDate: today, totalCount: 25, status: 'PENDING', placedAt: null },
  { id: 'o2', orderDate: '2026-04-04', totalCount: 30, status: 'PLACED', placedAt: '2026-04-04T09:30:00.000Z' },
];

function createMockApi(overrides?: Partial<OrderApi>): OrderApi {
  return {
    getOrders: vi.fn<(filter: { from: string; to: string }) => Promise<OrderResult[]>>().mockResolvedValue(mockOrders),
    placeOrder: vi.fn<(id: string) => Promise<OrderResult>>().mockResolvedValue({
      ...mockOrders[0], status: 'PLACED', placedAt: new Date().toISOString(),
    }),
    ...overrides,
  };
}

describe('OrderPage', () => {
  let api: OrderApi;

  beforeEach(() => {
    api = createMockApi();
  });

  it('注文一覧を表示する', async () => {
    render(<OrderPage orderApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('本日の注文数')).toBeInTheDocument();
    });
    expect(screen.getByText('注文履歴')).toBeInTheDocument();
    expect(api.getOrders).toHaveBeenCalled();
  });

  it('PENDING注文に「注文を確定」ボタンが表示される', async () => {
    render(<OrderPage orderApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('注文を確定')).toBeInTheDocument();
    });
  });

  it('注文確定ボタンで注文を確定できる', async () => {
    const user = userEvent.setup();
    render(<OrderPage orderApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('注文を確定')).toBeInTheDocument();
    });

    await user.click(screen.getByText('注文を確定'));

    await waitFor(() => {
      expect(api.placeOrder).toHaveBeenCalledWith('o1');
    });
  });

  it('ローディング中はローディング表示する', () => {
    const slowApi = createMockApi({
      getOrders: vi.fn<(filter: { from: string; to: string }) => Promise<OrderResult[]>>().mockReturnValue(new Promise(() => {})),
    });

    render(<OrderPage orderApi={slowApi} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('PLACED注文には「確定済」バッジが表示される', async () => {
    render(<OrderPage orderApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('確定済')).toBeInTheDocument();
    });
  });
});
