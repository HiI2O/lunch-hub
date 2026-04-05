/* eslint-disable @typescript-eslint/unbound-method */
import { ReceiveTicketUseCase } from './receive-ticket.use-case.js';
import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import type { ITicketPurchaseReservationRepository } from '../../domain/repositories/ticket-purchase-reservation.repository.js';
import { Ticket } from '../../domain/aggregates/ticket.js';
import { TicketPurchaseReservation } from '../../domain/aggregates/ticket-purchase-reservation.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createMockTicketRepo(): jest.Mocked<ITicketRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByOwnerId: jest.fn().mockResolvedValue([]),
  };
}

function createMockPrRepo(): jest.Mocked<ITicketPurchaseReservationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByUserId: jest.fn().mockResolvedValue([]),
    findByPurchaseDate: jest.fn().mockResolvedValue([]),
  };
}

describe('ReceiveTicketUseCase', () => {
  let useCase: ReceiveTicketUseCase;
  let ticketRepo: jest.Mocked<ITicketRepository>;
  let prRepo: jest.Mocked<ITicketPurchaseReservationRepository>;

  beforeEach(() => {
    ticketRepo = createMockTicketRepo();
    prRepo = createMockPrRepo();
    useCase = new ReceiveTicketUseCase(ticketRepo, prRepo);
  });

  it('チケットと購入予約の受取を確認する', async () => {
    const ticket = Ticket.create({
      id: 't1',
      ownerId: 'user-1',
      initialCount: 10,
      purchaseDate: '2026-04-10',
    });
    const pr = TicketPurchaseReservation.create({
      id: 'pr-1',
      userId: 'user-1',
      purchaseDate: '2026-04-10',
      quantity: 1,
    });
    pr.setTicketId('t1');
    ticketRepo.findById.mockResolvedValue(ticket);
    prRepo.findById.mockResolvedValue(pr);

    const result = await useCase.execute({
      purchaseReservationId: 'pr-1',
    });

    expect(result.ticketStatus).toBe('RECEIVED');
    expect(result.purchaseStatus).toBe('RECEIVED');
    expect(ticketRepo.save).toHaveBeenCalledTimes(1);
    expect(prRepo.save).toHaveBeenCalledTimes(1);
  });

  it('存在しない購入予約はNotFoundError', async () => {
    await expect(
      useCase.execute({ purchaseReservationId: 'not-found' }),
    ).rejects.toThrow(NotFoundError);
  });
});
