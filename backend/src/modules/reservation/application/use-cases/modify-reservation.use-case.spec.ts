/* eslint-disable @typescript-eslint/unbound-method */
import { ModifyReservationUseCase } from './modify-reservation.use-case.js';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createMockRepository(): jest.Mocked<IReservationRepository> {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn().mockResolvedValue(null),
    findByUserId: jest.fn().mockResolvedValue([]),
    findByDate: jest.fn().mockResolvedValue([]),
    findByUserIdAndDate: jest.fn().mockResolvedValue(null),
    findCalendarData: jest.fn().mockResolvedValue([]),
  };
}

function createReservation(): Reservation {
  return Reservation.create({
    id: 'reservation-id-1',
    userId: 'user-id-1',
    reservationDate: '2026-04-10',
    paymentMethod: PaymentMethod.create('CASH'),
  });
}

describe('ModifyReservationUseCase', () => {
  let useCase: ModifyReservationUseCase;
  let repository: jest.Mocked<IReservationRepository>;
  const beforeDeadline = new Date(Date.UTC(2026, 3, 5, 0, 0));

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new ModifyReservationUseCase(repository, () => beforeDeadline);
  });

  it('支払い方法をTICKETに変更できる', async () => {
    repository.findById.mockResolvedValue(createReservation());

    const result = await useCase.execute({
      reservationId: 'reservation-id-1',
      userId: 'user-id-1',
      paymentMethod: 'TICKET',
      ticketId: 'ticket-id',
    });

    expect(result.paymentMethod).toBe('TICKET');
    expect(result.ticketId).toBe('ticket-id');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('存在しない予約の場合NotFoundErrorを投げる', async () => {
    await expect(
      useCase.execute({
        reservationId: 'not-found',
        userId: 'user-id-1',
        paymentMethod: 'TICKET',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('他ユーザーの予約は変更できない', async () => {
    repository.findById.mockResolvedValue(createReservation());

    await expect(
      useCase.execute({
        reservationId: 'reservation-id-1',
        userId: 'other-user',
        paymentMethod: 'TICKET',
      }),
    ).rejects.toThrow('権限');
  });

  it('締め切り後は変更できない', async () => {
    const reservation = Reservation.create({
      id: 'reservation-id-1',
      userId: 'user-id-1',
      reservationDate: '2026-04-05',
      paymentMethod: PaymentMethod.create('CASH'),
    });
    repository.findById.mockResolvedValue(reservation);

    const afterDeadline = new Date(Date.UTC(2026, 3, 5, 1, 0));
    const lateUseCase = new ModifyReservationUseCase(
      repository,
      () => afterDeadline,
    );

    await expect(
      lateUseCase.execute({
        reservationId: 'reservation-id-1',
        userId: 'user-id-1',
        paymentMethod: 'TICKET',
      }),
    ).rejects.toThrow('締め切り');
  });
});
