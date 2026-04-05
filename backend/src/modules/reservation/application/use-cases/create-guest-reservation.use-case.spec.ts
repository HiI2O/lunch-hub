/* eslint-disable @typescript-eslint/unbound-method */
import { CreateGuestReservationUseCase } from './create-guest-reservation.use-case.js';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import type { IGuestRepository } from '../../domain/repositories/guest.repository.js';
import { Guest } from '../../domain/aggregates/guest.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createMockReservationRepo(): jest.Mocked<IReservationRepository> {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByDate: jest.fn(),
    findByUserIdAndDate: jest.fn().mockResolvedValue(null),
    findCalendarData: jest.fn(),
  };
}

function createMockGuestRepo(): jest.Mocked<IGuestRepository> {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn().mockResolvedValue(null),
    findByVisitDate: jest.fn(),
  };
}

describe('CreateGuestReservationUseCase', () => {
  let useCase: CreateGuestReservationUseCase;
  let reservationRepo: jest.Mocked<IReservationRepository>;
  let guestRepo: jest.Mocked<IGuestRepository>;
  const beforeDeadline = new Date(Date.UTC(2026, 3, 5, 0, 0));

  beforeEach(() => {
    reservationRepo = createMockReservationRepo();
    guestRepo = createMockGuestRepo();
    useCase = new CreateGuestReservationUseCase(
      reservationRepo,
      guestRepo,
      () => beforeDeadline,
    );
  });

  it('ゲスト予約を作成し、ゲストの訪問日を設定する', async () => {
    const guest = Guest.create({
      id: 'guest-1',
      guestName: '来客A様',
      createdByStaffId: 'staff-1',
    });
    guestRepo.findById.mockResolvedValue(guest);

    const result = await useCase.execute({
      guestId: 'guest-1',
      reservationDate: '2026-04-10',
      staffId: 'staff-1',
    });

    expect(result.paymentMethod).toBe('CASH');
    expect(result.status).toBe('CONFIRMED');
    expect(reservationRepo.save).toHaveBeenCalledTimes(1);
    expect(guestRepo.save).toHaveBeenCalledTimes(1);
    // ゲストの訪問日が予約日に設定される
    expect(guest.visitDate).toBe('2026-04-10');
  });

  it('存在しないゲストIDの場合NotFoundErrorを投げる', async () => {
    await expect(
      useCase.execute({
        guestId: 'not-found',
        reservationDate: '2026-04-10',
        staffId: 'staff-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('締め切り後の予約作成はエラーになる', async () => {
    const guest = Guest.create({
      id: 'guest-1',
      guestName: '来客A様',
      createdByStaffId: 'staff-1',
    });
    guestRepo.findById.mockResolvedValue(guest);

    const afterDeadline = new Date(Date.UTC(2026, 3, 10, 1, 0));
    const lateUseCase = new CreateGuestReservationUseCase(
      reservationRepo,
      guestRepo,
      () => afterDeadline,
    );

    await expect(
      lateUseCase.execute({
        guestId: 'guest-1',
        reservationDate: '2026-04-10',
        staffId: 'staff-1',
      }),
    ).rejects.toThrow('締め切り');
  });
});
