import { GetCalendarDataUseCase } from './get-calendar-data.use-case.js';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';

function createMockRepository(): jest.Mocked<IReservationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByDate: jest.fn(),
    findByUserIdAndDate: jest.fn(),
    findCalendarData: jest.fn().mockResolvedValue([]),
  };
}

describe('GetCalendarDataUseCase', () => {
  let useCase: GetCalendarDataUseCase;
  let repository: jest.Mocked<IReservationRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new GetCalendarDataUseCase(repository);
  });

  it('予約がある日にhasReservation:trueを返す', async () => {
    const reservation = Reservation.create({
      id: 'r-1',
      userId: 'user-1',
      reservationDate: '2026-04-10',
      paymentMethod: PaymentMethod.create('CASH'),
    });
    repository.findCalendarData.mockResolvedValue([reservation]);

    const result = await useCase.execute({
      userId: 'user-1',
      year: 2026,
      month: 4,
    });

    expect(result['2026-04-10']).toEqual({
      hasReservation: true,
      status: 'CONFIRMED',
    });
  });

  it('予約がない月は空オブジェクトを返す', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      year: 2026,
      month: 5,
    });

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('複数の予約を日ごとにマッピングする', async () => {
    const r1 = Reservation.create({
      id: 'r-1',
      userId: 'user-1',
      reservationDate: '2026-04-10',
      paymentMethod: PaymentMethod.create('CASH'),
    });
    const r2 = Reservation.create({
      id: 'r-2',
      userId: 'user-1',
      reservationDate: '2026-04-15',
      paymentMethod: PaymentMethod.create('TICKET'),
      ticketId: 't-1',
    });
    repository.findCalendarData.mockResolvedValue([r1, r2]);

    const result = await useCase.execute({
      userId: 'user-1',
      year: 2026,
      month: 4,
    });

    expect(Object.keys(result)).toHaveLength(2);
    expect(result['2026-04-10'].hasReservation).toBe(true);
    expect(result['2026-04-15'].hasReservation).toBe(true);
  });
});
