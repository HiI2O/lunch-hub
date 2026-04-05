import { GetReservationDetailUseCase } from './get-reservation-detail.use-case.js';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createMockRepository(): jest.Mocked<IReservationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByUserId: jest.fn(),
    findByDate: jest.fn(),
    findByUserIdAndDate: jest.fn(),
    findCalendarData: jest.fn(),
  };
}

describe('GetReservationDetailUseCase', () => {
  let useCase: GetReservationDetailUseCase;
  let repository: jest.Mocked<IReservationRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new GetReservationDetailUseCase(repository);
  });

  it('予約詳細を返す', async () => {
    const reservation = Reservation.create({
      id: 'r-1',
      userId: 'user-1',
      reservationDate: '2026-04-10',
      paymentMethod: PaymentMethod.create('TICKET'),
      ticketId: 'ticket-1',
    });
    repository.findById.mockResolvedValue(reservation);

    const result = await useCase.execute({
      reservationId: 'r-1',
      userId: 'user-1',
    });

    expect(result.id).toBe('r-1');
    expect(result.paymentMethod).toBe('TICKET');
    expect(result.ticketId).toBe('ticket-1');
  });

  it('存在しない予約の場合NotFoundErrorを投げる', async () => {
    await expect(
      useCase.execute({ reservationId: 'not-found', userId: 'user-1' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('他ユーザーの予約��取得できない', async () => {
    const reservation = Reservation.create({
      id: 'r-1',
      userId: 'user-1',
      reservationDate: '2026-04-10',
      paymentMethod: PaymentMethod.create('CASH'),
    });
    repository.findById.mockResolvedValue(reservation);

    await expect(
      useCase.execute({ reservationId: 'r-1', userId: 'other-user' }),
    ).rejects.toThrow('権限');
  });
});
