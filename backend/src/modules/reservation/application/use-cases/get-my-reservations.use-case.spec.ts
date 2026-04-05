/* eslint-disable @typescript-eslint/unbound-method */
import { GetMyReservationsUseCase } from './get-my-reservations.use-case.js';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';

function createMockRepository(): jest.Mocked<IReservationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue([]),
    findByDate: jest.fn(),
    findByUserIdAndDate: jest.fn(),
    findCalendarData: jest.fn(),
  };
}

describe('GetMyReservationsUseCase', () => {
  let useCase: GetMyReservationsUseCase;
  let repository: jest.Mocked<IReservationRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new GetMyReservationsUseCase(repository);
  });

  it('ユーザーの予約一覧を返す', async () => {
    const reservation = Reservation.create({
      id: 'r-1',
      userId: 'user-1',
      reservationDate: '2026-04-10',
      paymentMethod: PaymentMethod.create('CASH'),
    });
    repository.findByUserId.mockResolvedValue([reservation]);

    const result = await useCase.execute({
      userId: 'user-1',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r-1');
    expect(result[0].reservationDate).toBe('2026-04-10');
    expect(repository.findByUserId).toHaveBeenCalledWith(
      'user-1',
      undefined,
      undefined,
      undefined,
    );
  });

  it('フィルタパラメータを渡せる', async () => {
    repository.findByUserId.mockResolvedValue([]);

    await useCase.execute({
      userId: 'user-1',
      from: '2026-04-01',
      to: '2026-04-30',
      status: 'CONFIRMED',
    });

    expect(repository.findByUserId).toHaveBeenCalledWith(
      'user-1',
      '2026-04-01',
      '2026-04-30',
      'CONFIRMED',
    );
  });

  it('予約がない場合空配列を返す', async () => {
    const result = await useCase.execute({ userId: 'user-1' });
    expect(result).toEqual([]);
  });
});
