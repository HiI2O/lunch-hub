import { GetAllReservationsUseCase } from './get-all-reservations.use-case.js';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';

function createMockRepository(): jest.Mocked<IReservationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByDate: jest.fn().mockResolvedValue([]),
    findByUserIdAndDate: jest.fn(),
    findCalendarData: jest.fn(),
  };
}

describe('GetAllReservationsUseCase', () => {
  let useCase: GetAllReservationsUseCase;
  let repository: jest.Mocked<IReservationRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new GetAllReservationsUseCase(repository);
  });

  it('日付指定で全予約一覧を返す', async () => {
    const r1 = Reservation.create({
      id: 'r-1',
      userId: 'user-1',
      reservationDate: '2026-04-10',
      paymentMethod: PaymentMethod.create('CASH'),
    });
    const r2 = Reservation.create({
      id: 'r-2',
      userId: 'user-2',
      reservationDate: '2026-04-10',
      paymentMethod: PaymentMethod.create('TICKET'),
      ticketId: 't-1',
    });
    repository.findByDate.mockResolvedValue([r1, r2]);

    const result = await useCase.execute({ date: '2026-04-10' });

    expect(result.reservations).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.cashCount).toBe(1);
    expect(result.ticketCount).toBe(1);
  });

  it('予約がない場合空結果を返す', async () => {
    const result = await useCase.execute({ date: '2026-04-10' });

    expect(result.reservations).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.cashCount).toBe(0);
    expect(result.ticketCount).toBe(0);
  });
});
