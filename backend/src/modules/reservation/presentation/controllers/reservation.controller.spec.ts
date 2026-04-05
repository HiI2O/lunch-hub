/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller.js';
import { CreateReservationUseCase } from '../../application/use-cases/create-reservation.use-case.js';
import { CancelReservationUseCase } from '../../application/use-cases/cancel-reservation.use-case.js';
import { ModifyReservationUseCase } from '../../application/use-cases/modify-reservation.use-case.js';
import { GetMyReservationsUseCase } from '../../application/use-cases/get-my-reservations.use-case.js';
import { GetReservationDetailUseCase } from '../../application/use-cases/get-reservation-detail.use-case.js';
import { GetCalendarDataUseCase } from '../../application/use-cases/get-calendar-data.use-case.js';
import type { CurrentUserData } from '../../../iam/presentation/decorators/current-user.decorator.js';

describe('ReservationController', () => {
  let controller: ReservationController;
  let createUseCase: jest.Mocked<CreateReservationUseCase>;
  let cancelUseCase: jest.Mocked<CancelReservationUseCase>;
  let modifyUseCase: jest.Mocked<ModifyReservationUseCase>;
  let getMyUseCase: jest.Mocked<GetMyReservationsUseCase>;
  let getDetailUseCase: jest.Mocked<GetReservationDetailUseCase>;
  let calendarUseCase: jest.Mocked<GetCalendarDataUseCase>;

  const user: CurrentUserData = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'GENERAL_USER',
  };

  beforeEach(async () => {
    createUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateReservationUseCase>;
    cancelUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CancelReservationUseCase>;
    modifyUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ModifyReservationUseCase>;
    getMyUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetMyReservationsUseCase>;
    getDetailUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetReservationDetailUseCase>;
    calendarUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetCalendarDataUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        { provide: CreateReservationUseCase, useValue: createUseCase },
        { provide: CancelReservationUseCase, useValue: cancelUseCase },
        { provide: ModifyReservationUseCase, useValue: modifyUseCase },
        { provide: GetMyReservationsUseCase, useValue: getMyUseCase },
        { provide: GetReservationDetailUseCase, useValue: getDetailUseCase },
        { provide: GetCalendarDataUseCase, useValue: calendarUseCase },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
  });

  it('POST / はユーザーIDと共にCreateReservationUseCaseを呼ぶ', async () => {
    const mockResult = {
      id: 'r-1',
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
      ticketId: null,
      createdAt: new Date(),
    };
    createUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.createReservation(user, {
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
    });

    expect(createUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      ticketId: undefined,
    });
    expect(result.data).toEqual(mockResult);
  });

  it('GET / はGetMyReservationsUseCaseを呼ぶ', async () => {
    getMyUseCase.execute.mockResolvedValue([]);

    const result = await controller.getMyReservations(
      user,
      '2026-04-01',
      '2026-04-30',
    );

    expect(getMyUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      from: '2026-04-01',
      to: '2026-04-30',
      status: undefined,
    });
    expect(result.data).toEqual([]);
  });

  it('GET /calendar はGetCalendarDataUseCaseを呼ぶ', async () => {
    calendarUseCase.execute.mockResolvedValue({});

    const result = await controller.getCalendarData(user, '2026', '4');

    expect(calendarUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      year: 2026,
      month: 4,
    });
    expect(result.data).toEqual({});
  });

  it('GET /:id はGetReservationDetailUseCaseを呼ぶ', async () => {
    const mockResult = {
      id: 'r-1',
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
      ticketId: null,
      orderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    getDetailUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.getReservationDetail(user, 'r-1');

    expect(getDetailUseCase.execute).toHaveBeenCalledWith({
      reservationId: 'r-1',
      userId: 'user-1',
    });
    expect(result.data).toEqual(mockResult);
  });

  it('PUT /:id はModifyReservationUseCaseを呼ぶ', async () => {
    const mockResult = {
      id: 'r-1',
      reservationDate: '2026-04-10',
      paymentMethod: 'TICKET',
      status: 'CONFIRMED',
      ticketId: 't-1',
      createdAt: new Date(),
    };
    modifyUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.modifyReservation(user, 'r-1', {
      paymentMethod: 'TICKET',
      ticketId: 't-1',
    });

    expect(modifyUseCase.execute).toHaveBeenCalledWith({
      reservationId: 'r-1',
      userId: 'user-1',
      paymentMethod: 'TICKET',
      ticketId: 't-1',
    });
    expect(result.data).toEqual(mockResult);
  });

  it('DELETE /:id はCancelReservationUseCaseを呼ぶ', async () => {
    const mockResult = {
      id: 'r-1',
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CANCELLED',
      ticketId: null,
      createdAt: new Date(),
    };
    cancelUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.cancelReservation(user, 'r-1');

    expect(cancelUseCase.execute).toHaveBeenCalledWith({
      reservationId: 'r-1',
      userId: 'user-1',
    });
    expect(result.data).toEqual(mockResult);
  });
});
