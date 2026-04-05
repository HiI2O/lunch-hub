/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { StaffReservationController } from './staff-reservation.controller.js';
import { GetAllReservationsUseCase } from '../../application/use-cases/get-all-reservations.use-case.js';
import { ModifyReservationUseCase } from '../../application/use-cases/modify-reservation.use-case.js';
import { CancelReservationUseCase } from '../../application/use-cases/cancel-reservation.use-case.js';
import { CreateGuestUseCase } from '../../application/use-cases/create-guest.use-case.js';
import { CreateGuestReservationUseCase } from '../../application/use-cases/create-guest-reservation.use-case.js';
import type { CurrentUserData } from '../../../iam/presentation/decorators/current-user.decorator.js';

describe('StaffReservationController', () => {
  let controller: StaffReservationController;
  let getAllUseCase: jest.Mocked<GetAllReservationsUseCase>;
  let modifyUseCase: jest.Mocked<ModifyReservationUseCase>;
  let cancelUseCase: jest.Mocked<CancelReservationUseCase>;
  let createGuestUseCase: jest.Mocked<CreateGuestUseCase>;
  let createGuestReservationUseCase: jest.Mocked<CreateGuestReservationUseCase>;

  const staff: CurrentUserData = {
    userId: 'staff-1',
    email: 'staff@example.com',
    role: 'STAFF',
  };

  beforeEach(async () => {
    getAllUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllReservationsUseCase>;
    modifyUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ModifyReservationUseCase>;
    cancelUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CancelReservationUseCase>;
    createGuestUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateGuestUseCase>;
    createGuestReservationUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateGuestReservationUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffReservationController],
      providers: [
        Reflector,
        { provide: GetAllReservationsUseCase, useValue: getAllUseCase },
        { provide: ModifyReservationUseCase, useValue: modifyUseCase },
        { provide: CancelReservationUseCase, useValue: cancelUseCase },
        { provide: CreateGuestUseCase, useValue: createGuestUseCase },
        {
          provide: CreateGuestReservationUseCase,
          useValue: createGuestReservationUseCase,
        },
      ],
    }).compile();

    controller = module.get<StaffReservationController>(
      StaffReservationController,
    );
  });

  it('GET /reservations は全予約一覧を返す', async () => {
    getAllUseCase.execute.mockResolvedValue({
      reservations: [],
      total: 0,
      cashCount: 0,
      ticketCount: 0,
    });

    const result = await controller.getAllReservations('2026-04-10');

    expect(getAllUseCase.execute).toHaveBeenCalledWith({ date: '2026-04-10' });
    expect(result.data).toEqual([]);
    expect(result.meta).toEqual({ total: 0, cashCount: 0, ticketCount: 0 });
  });

  it('POST /guests はゲストを作成する', async () => {
    const mockResult = {
      id: 'g-1',
      guestName: '来客A様',
      createdAt: new Date(),
    };
    createGuestUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.createGuest(staff, {
      guestName: '来客A様',
    });

    expect(createGuestUseCase.execute).toHaveBeenCalledWith({
      guestName: '来客A様',
      createdByStaffId: 'staff-1',
    });
    expect(result.data).toEqual(mockResult);
  });

  it('POST /reservations/guest はゲスト予約を作成する', async () => {
    const mockResult = {
      id: 'r-1',
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
      ticketId: null,
      createdAt: new Date(),
    };
    createGuestReservationUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.createGuestReservation(staff, {
      guestId: 'g-1',
      reservationDate: '2026-04-10',
    });

    expect(createGuestReservationUseCase.execute).toHaveBeenCalledWith({
      guestId: 'g-1',
      reservationDate: '2026-04-10',
      staffId: 'staff-1',
    });
    expect(result.data).toEqual(mockResult);
  });
});
