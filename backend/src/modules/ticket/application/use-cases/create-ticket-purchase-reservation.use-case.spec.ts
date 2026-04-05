/* eslint-disable @typescript-eslint/unbound-method */
import { CreateTicketPurchaseReservationUseCase } from './create-ticket-purchase-reservation.use-case.js';
import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import type { ITicketPurchaseReservationRepository } from '../../domain/repositories/ticket-purchase-reservation.repository.js';

function createMockTicketRepo(): jest.Mocked<ITicketRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByOwnerId: jest.fn().mockResolvedValue([]),
  };
}

function createMockPrRepo(): jest.Mocked<ITicketPurchaseReservationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue([]),
    findByPurchaseDate: jest.fn().mockResolvedValue([]),
  };
}

describe('CreateTicketPurchaseReservationUseCase', () => {
  let useCase: CreateTicketPurchaseReservationUseCase;
  let ticketRepo: jest.Mocked<ITicketRepository>;
  let prRepo: jest.Mocked<ITicketPurchaseReservationRepository>;

  beforeEach(() => {
    ticketRepo = createMockTicketRepo();
    prRepo = createMockPrRepo();
    useCase = new CreateTicketPurchaseReservationUseCase(ticketRepo, prRepo);
  });

  it('チケット購入予約を作成し、チケットも同時に作成する', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      purchaseDate: '2026-04-10',
      quantity: 2,
    });

    expect(result.quantity).toBe(2);
    expect(result.status).toBe('PENDING');
    expect(result.totalTickets).toBe(20);
    expect(prRepo.save).toHaveBeenCalledTimes(1);
    expect(ticketRepo.save).toHaveBeenCalledTimes(1);
  });

  it('不正なセット数でエラーを投げる', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        purchaseDate: '2026-04-10',
        quantity: 0,
      }),
    ).rejects.toThrow();
  });
});
