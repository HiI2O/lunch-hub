/* eslint-disable @typescript-eslint/unbound-method */
import { CancelTicketPurchaseReservationUseCase } from './cancel-ticket-purchase-reservation.use-case.js';
import type { ITicketPurchaseReservationRepository } from '../../domain/repositories/ticket-purchase-reservation.repository.js';
import { TicketPurchaseReservation } from '../../domain/aggregates/ticket-purchase-reservation.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createMockRepo(): jest.Mocked<ITicketPurchaseReservationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByUserId: jest.fn().mockResolvedValue([]),
    findByPurchaseDate: jest.fn().mockResolvedValue([]),
  };
}

describe('CancelTicketPurchaseReservationUseCase', () => {
  let useCase: CancelTicketPurchaseReservationUseCase;
  let repo: jest.Mocked<ITicketPurchaseReservationRepository>;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new CancelTicketPurchaseReservationUseCase(repo);
  });

  it('購入予約をキャンセルする', async () => {
    const pr = TicketPurchaseReservation.create({
      id: 'pr-1',
      userId: 'user-1',
      purchaseDate: '2026-04-10',
      quantity: 1,
    });
    repo.findById.mockResolvedValue(pr);

    const result = await useCase.execute({
      purchaseReservationId: 'pr-1',
      userId: 'user-1',
    });

    expect(result.status).toBe('CANCELLED');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('存在しない購入予約はNotFoundError', async () => {
    await expect(
      useCase.execute({
        purchaseReservationId: 'not-found',
        userId: 'user-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('他ユーザーの購入予約はキャンセルできない', async () => {
    const pr = TicketPurchaseReservation.create({
      id: 'pr-1',
      userId: 'user-1',
      purchaseDate: '2026-04-10',
      quantity: 1,
    });
    repo.findById.mockResolvedValue(pr);

    await expect(
      useCase.execute({
        purchaseReservationId: 'pr-1',
        userId: 'other-user',
      }),
    ).rejects.toThrow('権限');
  });
});
