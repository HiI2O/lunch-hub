import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import { ToastProvider } from '../../contexts/ToastContext';
import { GuestReservationPage } from './GuestReservationPage';
import type { StaffReservationApi } from '../../api/staff-reservation';
import type { GuestResult, GuestReservationResult } from '../../api/types';

// --- Mock ---

const noop = async (): Promise<void> => {};

function createAuthValue(): AuthContextValue {
  return {
    user: { id: 'staff-1', email: 'staff@example.com', displayName: 'スタッフ', role: 'STAFF' },
    isAuthenticated: true,
    isLoading: false,
    login: noop,
    logout: noop,
    updateUser: () => {},
  };
}

function createMockStaffApi(overrides?: Partial<StaffReservationApi>): StaffReservationApi {
  return {
    getAllReservations: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, cashCount: 0, ticketCount: 0 } }),
    createGuest: vi.fn().mockResolvedValue({ id: 'g1', guestName: 'ゲスト', createdAt: '' }),
    createGuestReservation: vi.fn().mockResolvedValue({
      id: 'r1',
      guest: { id: 'g1', guestName: 'ゲスト' },
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
    }),
    modifyReservation: vi.fn().mockResolvedValue({}),
    cancelReservation: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

function renderGuestPage(
  apiOverrides?: Partial<StaffReservationApi>,
): { api: StaffReservationApi } {
  const api = createMockStaffApi(apiOverrides);
  render(
    <AuthContext.Provider value={createAuthValue()}>
      <ToastProvider>
        <MemoryRouter>
          <GuestReservationPage staffReservationApi={api} />
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>,
  );
  return { api };
}

describe('GuestReservationPage', () => {
  it('ゲスト予約作成フォームが表示される', () => {
    renderGuestPage();

    expect(screen.getByLabelText(/ゲスト名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/予約日/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ゲスト予約を作成/ })).toBeInTheDocument();
  });

  it('ゲスト名と予約日を入力してゲスト予約を作成できる', async () => {
    const user = userEvent.setup();
    const mockGuest: GuestResult = {
      id: 'g-new',
      guestName: '佐藤様',
      createdAt: '2026-04-08T10:00:00Z',
    };
    const mockReservation: GuestReservationResult = {
      id: 'r-new',
      guest: { id: 'g-new', guestName: '佐藤様' },
      reservationDate: '2026-04-15',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
    };
    const createGuest = vi.fn().mockResolvedValue(mockGuest);
    const createGuestReservation = vi.fn().mockResolvedValue(mockReservation);

    renderGuestPage({ createGuest, createGuestReservation });

    await user.type(screen.getByLabelText(/ゲスト名/), '佐藤様');
    await user.type(screen.getByLabelText(/予約日/), '2026-04-15');
    await user.click(screen.getByRole('button', { name: /ゲスト予約を作成/ }));

    await waitFor(() => {
      expect(createGuest).toHaveBeenCalledWith('佐藤様');
    });
    await waitFor(() => {
      expect(createGuestReservation).toHaveBeenCalledWith('g-new', '2026-04-15');
    });
  });

  it('ゲスト名が空の場合はバリデーションエラーを表示する', async () => {
    const user = userEvent.setup();
    renderGuestPage();

    await user.click(screen.getByRole('button', { name: /ゲスト予約を作成/ }));

    await waitFor(() => {
      expect(screen.getByText(/ゲスト名を入力してください/)).toBeInTheDocument();
    });
  });

  it('予約日が空の場合はバリデーションエラーを表示する', async () => {
    const user = userEvent.setup();
    renderGuestPage();

    await user.type(screen.getByLabelText(/ゲスト名/), '佐藤様');
    await user.click(screen.getByRole('button', { name: /ゲスト予約を作成/ }));

    await waitFor(() => {
      expect(screen.getByText(/予約日を選択してください/)).toBeInTheDocument();
    });
  });
});
