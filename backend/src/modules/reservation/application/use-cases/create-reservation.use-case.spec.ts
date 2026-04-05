/* eslint-disable @typescript-eslint/unbound-method */
import { CreateReservationUseCase } from './create-reservation.use-case.js';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import type { CreateReservationDto } from '../dto/create-reservation.dto.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { ConflictError } from '../../../../shared/domain/errors/conflict.error.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';

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

describe('CreateReservationUseCase', () => {
  let useCase: CreateReservationUseCase;
  let repository: jest.Mocked<IReservationRepository>;

  const dto: CreateReservationDto = {
    userId: '660e8400-e29b-41d4-a716-446655440001',
    reservationDate: '2026-04-10',
    paymentMethod: 'CASH',
  };

  beforeEach(() => {
    repository = createMockRepository();
    // 締め切り前の時刻を固定（9:00 JST = 0:00 UTC）
    const beforeDeadline = new Date(Date.UTC(2026, 3, 5, 0, 0));
    useCase = new CreateReservationUseCase(repository, () => beforeDeadline);
  });

  it('予約を作成してリポジトリに保存する', async () => {
    const result = await useCase.execute(dto);

    expect(result.reservationDate).toBe('2026-04-10');
    expect(result.paymentMethod).toBe('CASH');
    expect(result.status).toBe('CONFIRMED');
    expect(result.ticketId).toBeNull();
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('チケット払いの場合ticketIdが設定される', async () => {
    const result = await useCase.execute({
      ...dto,
      paymentMethod: 'TICKET',
      ticketId: 'ticket-id-123',
    });

    expect(result.paymentMethod).toBe('TICKET');
    expect(result.ticketId).toBe('ticket-id-123');
  });

  it('同一ユーザー・同一日に重複予約がある場合ConflictErrorを投げる', async () => {
    const existing = Reservation.create({
      id: 'existing-id',
      userId: dto.userId,
      reservationDate: dto.reservationDate,
      paymentMethod: PaymentMethod.create('CASH'),
    });
    repository.findByUserIdAndDate.mockResolvedValue(existing);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictError);
  });

  it('無効な支払い方法の場合ValidationErrorを投げる', async () => {
    await expect(
      useCase.execute({ ...dto, paymentMethod: 'INVALID' }),
    ).rejects.toThrow(ValidationError);
  });

  it('締め切り後の当日予約はValidationErrorを投げる', async () => {
    // 10:00 JST = 1:00 UTC（締め切り9:30を過ぎている）
    const afterDeadline = new Date(Date.UTC(2026, 3, 10, 1, 0));
    const lateUseCase = new CreateReservationUseCase(
      repository,
      () => afterDeadline,
    );

    await expect(lateUseCase.execute(dto)).rejects.toThrow('締め切り');
  });

  it('過去の日付の予約はValidationErrorを投げる', async () => {
    await expect(
      useCase.execute({ ...dto, reservationDate: '2026-04-04' }),
    ).rejects.toThrow('予約可能期間');
  });

  it('予約可能期間外の日付はValidationErrorを投げる', async () => {
    await expect(
      useCase.execute({ ...dto, reservationDate: '2026-07-01' }),
    ).rejects.toThrow('予約可能期間');
  });
});
