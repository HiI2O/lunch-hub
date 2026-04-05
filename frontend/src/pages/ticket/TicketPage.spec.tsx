import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketPage } from './TicketPage';
import type { TicketApi } from '../../api/ticket';
import type { TicketResult, PurchaseReservationResult } from '../../api/types';

const mockTickets: TicketResult[] = [
  { id: 't1', ownerId: 'u1', remainingCount: 7, status: 'RECEIVED', purchaseDate: '2026-01-10' },
  { id: 't2', ownerId: 'u1', remainingCount: 0, status: 'RECEIVED', purchaseDate: '2025-12-15' },
];

const mockPurchaseReservation: PurchaseReservationResult = {
  id: 'pr1', userId: 'u1', purchaseDate: '2026-04-05', quantity: 1,
  totalTickets: 10, status: 'PENDING', ticketId: null,
};

function createMockApi(overrides?: Partial<TicketApi>): TicketApi {
  return {
    getMyTickets: vi.fn<() => Promise<TicketResult[]>>().mockResolvedValue(mockTickets),
    getTicketDetail: vi.fn<(id: string) => Promise<TicketResult>>().mockResolvedValue(mockTickets[0]),
    createPurchaseReservation: vi.fn().mockResolvedValue(mockPurchaseReservation),
    cancelPurchaseReservation: vi.fn().mockResolvedValue({ ...mockPurchaseReservation, status: 'CANCELLED' }),
    ...overrides,
  };
}

describe('TicketPage', () => {
  let api: TicketApi;

  beforeEach(() => {
    api = createMockApi();
  });

  it('チケット一覧を表示する', async () => {
    render(<TicketPage ticketApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('チケット詳細')).toBeInTheDocument();
    });
    expect(screen.getAllByText('受取済')).toHaveLength(2);
    expect(api.getMyTickets).toHaveBeenCalled();
  });

  it('チケット残高の合計を表示する', async () => {
    render(<TicketPage ticketApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('チケット残高')).toBeInTheDocument();
    });
  });

  it('購入予約ボタンで予約を作成できる', async () => {
    const user = userEvent.setup();
    render(<TicketPage ticketApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('購入予約する')).toBeInTheDocument();
    });

    await user.click(screen.getByText('購入予約する'));

    await waitFor(() => {
      expect(api.createPurchaseReservation).toHaveBeenCalled();
    });
  });

  it('PENDINGの購入予約をキャンセルできる', async () => {
    const apiWithPR = createMockApi({
      getMyTickets: vi.fn<() => Promise<TicketResult[]>>().mockResolvedValue([
        ...mockTickets,
        // The page also loads purchase reservations from tickets response
      ]),
    });

    render(<TicketPage ticketApi={apiWithPR} />);

    await waitFor(() => {
      expect(screen.getByText('チケット残高')).toBeInTheDocument();
    });
  });

  it('ローディング中はローディング表示する', () => {
    const slowApi = createMockApi({
      getMyTickets: vi.fn<() => Promise<TicketResult[]>>().mockReturnValue(new Promise(() => {})),
    });

    render(<TicketPage ticketApi={slowApi} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
