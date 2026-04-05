import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import { ToastProvider } from '../../contexts/ToastContext';
import { HistoryPage } from './HistoryPage';
import type { ReservationResult } from '../../api/types';
import type { ReservationApi } from '../../api/reservation';

// --- Mock ---

const noop = async (): Promise<void> => {};

function createAuthValue(): AuthContextValue {
  return {
    user: { id: 'user-1', email: 'test@example.com', displayName: 'テスト', role: 'GENERAL_USER' },
    isAuthenticated: true,
    isLoading: false,
    login: noop,
    logout: noop,
    updateUser: () => {},
  };
}

function createMockReservationApi(overrides?: Partial<ReservationApi>): ReservationApi {
  return {
    getMyReservations: vi.fn().mockResolvedValue([]),
    getReservationDetail: vi.fn().mockResolvedValue(null),
    getCalendarData: vi.fn().mockResolvedValue({}),
    createReservation: vi.fn().mockResolvedValue({}),
    modifyReservation: vi.fn().mockResolvedValue({}),
    cancelReservation: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

function renderHistoryPage(
  apiOverrides?: Partial<ReservationApi>,
): { api: ReservationApi } {
  const api = createMockReservationApi(apiOverrides);
  render(
    <AuthContext.Provider value={createAuthValue()}>
      <ToastProvider>
        <MemoryRouter>
          <HistoryPage reservationApi={api} />
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>,
  );
  return { api };
}

const mockReservations: ReservationResult[] = [
  {
    id: 'r1',
    reservationDate: '2026-04-20',
    paymentMethod: 'TICKET',
    status: 'CONFIRMED',
    ticketId: 'ticket-1',
    createdAt: '2026-04-18T10:30:00Z',
  },
  {
    id: 'r2',
    reservationDate: '2026-04-17',
    paymentMethod: 'CASH',
    status: 'FINALIZED',
    ticketId: null,
    createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'r3',
    reservationDate: '2026-04-15',
    paymentMethod: 'TICKET',
    status: 'CANCELLED',
    ticketId: 'ticket-2',
    createdAt: '2026-04-14T14:20:00Z',
  },
];

describe('HistoryPage', () => {
  it('予約一覧をAPIから取得して表示する', async () => {
    const getMyReservations = vi.fn().mockResolvedValue(mockReservations);
    renderHistoryPage({ getMyReservations });

    await waitFor(() => {
      expect(getMyReservations).toHaveBeenCalled();
    });

    expect(screen.getByText('2026-04-20')).toBeInTheDocument();
    expect(screen.getByText('2026-04-17')).toBeInTheDocument();
    expect(screen.getByText('2026-04-15')).toBeInTheDocument();
  });

  it('ステータスバッジが正しく表示される', async () => {
    const getMyReservations = vi.fn().mockResolvedValue(mockReservations);
    renderHistoryPage({ getMyReservations });

    await waitFor(() => {
      expect(screen.getByText('予約済')).toBeInTheDocument();
    });
    expect(screen.getByText('確定')).toBeInTheDocument();
    // CANCELLEDバッジはbadge-dangerクラスを持つ
    const cancelledBadge = screen.getByText('キャンセル', { selector: '.badge-danger' });
    expect(cancelledBadge).toBeInTheDocument();
  });

  it('CONFIRMED予約にキャンセルボタンが表示される', async () => {
    const getMyReservations = vi.fn().mockResolvedValue(mockReservations);
    renderHistoryPage({ getMyReservations });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument();
    });

    // キャンセルボタンは1つだけ（r1のCONFIRMEDのみ）
    const cancelButtons = screen.getAllByRole('button', { name: /キャンセル/ });
    expect(cancelButtons).toHaveLength(1);
  });

  it('キャンセルボタンクリックで予約をキャンセルできる', async () => {
    const user = userEvent.setup();
    const getMyReservations = vi.fn().mockResolvedValue(mockReservations);
    const cancelReservation = vi.fn().mockResolvedValue({ id: 'r1', status: 'CANCELLED' });
    renderHistoryPage({ getMyReservations, cancelReservation });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /キャンセル/ }));

    await waitFor(() => {
      expect(cancelReservation).toHaveBeenCalledWith('r1');
    });
  });

  it('予約がない場合メッセージを表示する', async () => {
    renderHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/予約履歴がありません/)).toBeInTheDocument();
    });
  });
});
