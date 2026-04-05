/* eslint-disable @typescript-eslint/unbound-method */
import { CancelReservationUseCase } from './cancel-reservation.use-case.js';
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

function createReservation(date: string = '2026-04-10'): Reservation {
  return Reservation.create({
    id: 'reservation-id-1',
    userId: 'user-id-1',
    reservationDate: date,
    paymentMethod: PaymentMethod.create('CASH'),
  });
}

describe('CancelReservationUseCase', () => {
  let useCase: CancelReservationUseCase;
  let repository: jest.Mocked<IReservationRepository>;
  const beforeDeadline = new Date(Date.UTC(2026, 3, 5, 0, 0)); // 9:00 JST

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new CancelReservationUseCase(repository, () => beforeDeadline);
  });

  it('予約をキャンセルしてリポジトリに保存する', async () => {
    const reservation = createReservation();
    repository.findById.mockResolvedValue(reservation);

    const result = await useCase.execute({
      reservationId: 'reservation-id-1',
      userId: 'user-id-1',
    });

    expect(result.status).toBe('CANCELLED');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('存在しない予約IDの場合NotFoundErrorを投げる', async () => {
    await expect(
      useCase.execute({ reservationId: 'not-found', userId: 'user-id-1' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('他ユーザーの予約はキャンセルできない', async () => {
    const reservation = createReservation();
    repository.findById.mockResolvedValue(reservation);

    await expect(
      useCase.execute({
        reservationId: 'reservation-id-1',
        userId: 'other-user-id',
      }),
    ).rejects.toThrow('権限');
  });

  it('締め切り後の当日予約キャンセルはValidationErrorを投げる', async () => {
    const reservation = createReservation('2026-04-05');
    repository.findById.mockResolvedValue(reservation);

    const afterDeadline = new Date(Date.UTC(2026, 3, 5, 1, 0)); // 10:00 JST
    const lateUseCase = new CancelReservationUseCase(
      repository,
      () => afterDeadline,
    );

    await expect(
      lateUseCase.execute({
        reservationId: 'reservation-id-1',
        userId: 'user-id-1',
      }),
    ).rejects.toThrow('締め切り');
  });
});
