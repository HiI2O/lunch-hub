import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import { ToastProvider } from '../../contexts/ToastContext';
import { CalendarPage } from './CalendarPage';
import type { CalendarData, ReservationResult } from '../../api/types';
import type { ReservationApi } from '../../api/reservation';
import type { User } from '../../api/types';

// --- Mock ---

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'テストユーザー',
  role: 'GENERAL_USER',
};

const noop = async (): Promise<void> => {};

function createAuthValue(overrides?: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: noop,
    logout: noop,
    updateUser: () => {},
    ...overrides,
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

// CalendarPage に reservationApi を注入するため props で渡す設計
function renderCalendarPage(
  apiOverrides?: Partial<ReservationApi>,
  authOverrides?: Partial<AuthContextValue>,
): { api: ReservationApi } {
  const api = createMockReservationApi(apiOverrides);
  render(
    <AuthContext.Provider value={createAuthValue(authOverrides)}>
      <ToastProvider>
        <MemoryRouter>
          <CalendarPage reservationApi={api} />
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>,
  );
  return { api };
}

// 締め切り判定のモック
vi.mock('../../utils/deadline', () => ({
  isBeforeDeadline: vi.fn().mockReturnValue(true),
}));

import { isBeforeDeadline } from '../../utils/deadline';

describe('CalendarPage', () => {
  describe('カレンダー表示', () => {
    it('年月と曜日ヘッダーが表示される', async () => {
      renderCalendarPage();

      await waitFor(() => {
        expect(screen.getByText(/\d{4}年\s*\d{1,2}月/)).toBeInTheDocument();
      });
      expect(screen.getByText('日')).toBeInTheDocument();
      expect(screen.getByText('月')).toBeInTheDocument();
      expect(screen.getByText('土')).toBeInTheDocument();
    });

    it('APIからカレンダーデータを取得して予約状態を表示する', async () => {
      const calendarData: CalendarData = {
        '2026-04-10': { hasReservation: true, status: 'CONFIRMED' },
        '2026-04-15': { hasReservation: true, status: 'CANCELLED' },
      };
      const getCalendarData = vi.fn().mockResolvedValue(calendarData);

      renderCalendarPage({ getCalendarData });

      await waitFor(() => {
        expect(getCalendarData).toHaveBeenCalled();
      });
    });

    it('前月ボタンで月を切り替えられる', async () => {
      const user = userEvent.setup();
      const getCalendarData = vi.fn().mockResolvedValue({});
      renderCalendarPage({ getCalendarData });

      await waitFor(() => {
        expect(getCalendarData).toHaveBeenCalledTimes(1);
      });

      const prevButton = screen.getByRole('button', { name: /前月/ });
      await user.click(prevButton);

      await waitFor(() => {
        expect(getCalendarData).toHaveBeenCalledTimes(2);
      });
    });

    it('翌月ボタンで月を切り替えられる', async () => {
      const user = userEvent.setup();
      const getCalendarData = vi.fn().mockResolvedValue({});
      renderCalendarPage({ getCalendarData });

      await waitFor(() => {
        expect(getCalendarData).toHaveBeenCalledTimes(1);
      });

      const nextButton = screen.getByRole('button', { name: /翌月/ });
      await user.click(nextButton);

      await waitFor(() => {
        expect(getCalendarData).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('予約作成', () => {
    it('日付をクリックすると予約ダイアログが表示される', async () => {
      const user = userEvent.setup();
      renderCalendarPage();

      await waitFor(() => {
        expect(screen.getByText(/\d{4}年/)).toBeInTheDocument();
      });

      // 当月の15日をクリック
      const dayButton = screen.getByRole('button', { name: '15' });
      await user.click(dayButton);

      await waitFor(() => {
        expect(screen.getByText(/予約する/)).toBeInTheDocument();
      });
    });

    it('現金で予約を作成できる', async () => {
      const user = userEvent.setup();
      const mockResult: ReservationResult = {
        id: 'new-r1',
        reservationDate: '2026-04-15',
        paymentMethod: 'CASH',
        status: 'CONFIRMED',
        ticketId: null,
        createdAt: '2026-04-08T10:00:00Z',
      };
      const createReservation = vi.fn().mockResolvedValue(mockResult);
      const getCalendarData = vi.fn().mockResolvedValue({});
      renderCalendarPage({ createReservation, getCalendarData });

      await waitFor(() => {
        expect(screen.getByText(/\d{4}年/)).toBeInTheDocument();
      });

      // 15日クリック → 現金選択 → 予約
      const dayButton = screen.getByRole('button', { name: '15' });
      await user.click(dayButton);

      await waitFor(() => {
        expect(screen.getByText(/予約する/)).toBeInTheDocument();
      });

      // 現金ラジオ選択（デフォルトで選択済みだが明示的にクリック）
      const cashRadio = screen.getByLabelText('現金');
      await user.click(cashRadio);

      const submitBtn = screen.getByRole('button', { name: /予約する/ });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(createReservation).toHaveBeenCalledWith(
          expect.objectContaining({ paymentMethod: 'CASH' }),
        );
      });
    });
  });

  describe('締め切り表示', () => {
    it('締め切り後は予約ダイアログに「締切済」が表示され予約ボタンが無効化される', async () => {
      vi.mocked(isBeforeDeadline).mockReturnValue(false);
      const user = userEvent.setup();
      renderCalendarPage();

      await waitFor(() => {
        expect(screen.getByText(/\d{4}年/)).toBeInTheDocument();
      });

      const dayButton = screen.getByRole('button', { name: '15' });
      await user.click(dayButton);

      await waitFor(() => {
        expect(screen.getByText('締切済')).toBeInTheDocument();
      });

      // 予約ボタンが無効化されている
      const submitBtn = screen.getByRole('button', { name: /予約する/ });
      expect(submitBtn).toBeDisabled();

      // クリーンアップ
      vi.mocked(isBeforeDeadline).mockReturnValue(true);
    });

    it('締め切り後はキャンセルボタンが無効化される', async () => {
      vi.mocked(isBeforeDeadline).mockReturnValue(false);
      const user = userEvent.setup();
      const calendarData: CalendarData = {
        '2026-04-15': { hasReservation: true, status: 'CONFIRMED' },
      };
      const getCalendarData = vi.fn().mockResolvedValue(calendarData);
      const getMyReservations = vi.fn().mockResolvedValue([
        {
          id: 'r1',
          reservationDate: '2026-04-15',
          paymentMethod: 'CASH',
          status: 'CONFIRMED',
          ticketId: null,
          createdAt: '2026-04-08T10:00:00Z',
        },
      ]);

      renderCalendarPage({ getCalendarData, getMyReservations });

      await waitFor(() => {
        expect(getCalendarData).toHaveBeenCalled();
      });

      const dayButton = screen.getByRole('button', { name: '15' });
      await user.click(dayButton);

      await waitFor(() => {
        expect(screen.getByText('締切済')).toBeInTheDocument();
      });

      const cancelBtn = screen.getByRole('button', { name: /キャンセル/ });
      expect(cancelBtn).toBeDisabled();

      vi.mocked(isBeforeDeadline).mockReturnValue(true);
    });
  });

  describe('予約キャンセル', () => {
    it('予約済み日付をクリックしてキャンセルできる', async () => {
      const user = userEvent.setup();
      const calendarData: CalendarData = {
        '2026-04-15': { hasReservation: true, status: 'CONFIRMED' },
      };
      const getCalendarData = vi.fn().mockResolvedValue(calendarData);
      const getReservationDetail = vi.fn().mockResolvedValue({
        id: 'r1',
        reservationDate: '2026-04-15',
        paymentMethod: 'CASH',
        status: 'CONFIRMED',
        ticketId: null,
        createdAt: '2026-04-08T10:00:00Z',
        updatedAt: '2026-04-08T10:00:00Z',
      });
      const cancelReservation = vi.fn().mockResolvedValue({
        id: 'r1',
        status: 'CANCELLED',
      });
      const getMyReservations = vi.fn().mockResolvedValue([
        {
          id: 'r1',
          reservationDate: '2026-04-15',
          paymentMethod: 'CASH',
          status: 'CONFIRMED',
          ticketId: null,
          createdAt: '2026-04-08T10:00:00Z',
        },
      ]);

      renderCalendarPage({
        getCalendarData,
        getReservationDetail,
        cancelReservation,
        getMyReservations,
      });

      await waitFor(() => {
        expect(getCalendarData).toHaveBeenCalled();
      });

      // 予約済みの15日をクリック
      const dayButton = screen.getByRole('button', { name: '15' });
      await user.click(dayButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /キャンセル/ }),
        ).toBeInTheDocument();
      });

      const cancelBtn = screen.getByRole('button', { name: /キャンセル/ });
      await user.click(cancelBtn);

      await waitFor(() => {
        expect(cancelReservation).toHaveBeenCalledWith('r1');
      });
    });
  });
});
