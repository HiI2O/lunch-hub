/* eslint-disable @typescript-eslint/unbound-method */
import { TicketController } from './ticket.controller.js';
import type { GetMyTicketsUseCase } from '../../application/use-cases/get-my-tickets.use-case.js';
import type { GetTicketDetailUseCase } from '../../application/use-cases/get-ticket-detail.use-case.js';
import type { CreateTicketPurchaseReservationUseCase } from '../../application/use-cases/create-ticket-purchase-reservation.use-case.js';
import type { CancelTicketPurchaseReservationUseCase } from '../../application/use-cases/cancel-ticket-purchase-reservation.use-case.js';
import type { CurrentUserData } from '../../../iam/presentation/decorators/current-user.decorator.js';
import type { TicketResultDto } from '../../application/dto/ticket-result.dto.js';
import type { PurchaseReservationResultDto } from '../../application/dto/purchase-reservation-result.dto.js';

const mockTicketResult: TicketResultDto = {
  id: 't1',
  ownerId: 'user-1',
  remainingCount: 10,
  status: 'PENDING',
  purchaseDate: '2026-04-05',
};

const mockPRResult: PurchaseReservationResultDto = {
  id: 'pr-1',
  userId: 'user-1',
  purchaseDate: '2026-04-05',
  quantity: 2,
  totalTickets: 20,
  status: 'PENDING',
  ticketId: 'ticket-1',
};

describe('TicketController', () => {
  let controller: TicketController;
  let getMyTickets: jest.Mocked<GetMyTicketsUseCase>;
  let getTicketDetail: jest.Mocked<GetTicketDetailUseCase>;
  let createPurchaseReservation: jest.Mocked<CreateTicketPurchaseReservationUseCase>;
  let cancelPurchaseReservation: jest.Mocked<CancelTicketPurchaseReservationUseCase>;
  const currentUser: CurrentUserData = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'GENERAL_USER',
  };

  beforeEach(() => {
    getMyTickets = { execute: jest.fn() } as unknown as jest.Mocked<GetMyTicketsUseCase>;
    getTicketDetail = { execute: jest.fn() } as unknown as jest.Mocked<GetTicketDetailUseCase>;
    createPurchaseReservation = { execute: jest.fn() } as unknown as jest.Mocked<CreateTicketPurchaseReservationUseCase>;
    cancelPurchaseReservation = { execute: jest.fn() } as unknown as jest.Mocked<CancelTicketPurchaseReservationUseCase>;
    controller = new TicketController(
      getMyTickets,
      getTicketDetail,
      createPurchaseReservation,
      cancelPurchaseReservation,
    );
  });

  describe('GET /tickets — listMyTickets', () => {
    it('GetMyTicketsUseCaseにリクエストユーザーのIDを渡して呼び出す', async () => {
      getMyTickets.execute.mockResolvedValue([]);

      await controller.listMyTickets(currentUser);

      expect(getMyTickets.execute).toHaveBeenCalledWith({
        userId: 'user-1',
      });
    });

    it('ユースケースの戻り値を{ data: [...] }として返す', async () => {
      getMyTickets.execute.mockResolvedValue([mockTicketResult]);

      const result = await controller.listMyTickets(currentUser);

      expect(result).toEqual({ data: [mockTicketResult] });
    });
  });

  describe('GET /tickets/:id — detail', () => {
    it('GetTicketDetailUseCaseにチケットIDとリクエストユーザーIDを渡して呼び出す', async () => {
      getTicketDetail.execute.mockResolvedValue(mockTicketResult);

      await controller.detail('t1', currentUser);

      expect(getTicketDetail.execute).toHaveBeenCalledWith({
        ticketId: 't1',
        userId: 'user-1',
      });
    });

    it('ユースケースの戻り値を{ data: { ... } }として返す', async () => {
      getTicketDetail.execute.mockResolvedValue(mockTicketResult);

      const result = await controller.detail('t1', currentUser);

      expect(result).toEqual({ data: mockTicketResult });
    });
  });

  describe('POST /tickets/purchase — createPurchase', () => {
    it('CreateTicketPurchaseReservationUseCaseにリクエストユーザーIDとDTOを渡して呼び出す', async () => {
      createPurchaseReservation.execute.mockResolvedValue(mockPRResult);

      await controller.createPurchase(
        { purchaseDate: '2026-04-05', quantity: 2 },
        currentUser,
      );

      expect(createPurchaseReservation.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        purchaseDate: '2026-04-05',
        quantity: 2,
      });
    });

    it('レスポンスに{ data: { ... } }を返す', async () => {
      createPurchaseReservation.execute.mockResolvedValue(mockPRResult);

      const result = await controller.createPurchase(
        { purchaseDate: '2026-04-05', quantity: 1 },
        currentUser,
      );

      expect(result).toEqual({ data: mockPRResult });
    });
  });

  describe('DELETE /tickets/purchase/:id — cancelPurchase', () => {
    it('CancelTicketPurchaseReservationUseCaseに購入予約IDとリクエストユーザーIDを渡して呼び出す', async () => {
      const cancelled = { ...mockPRResult, status: 'CANCELLED' };
      cancelPurchaseReservation.execute.mockResolvedValue(cancelled);

      await controller.cancelPurchase('pr-1', currentUser);

      expect(cancelPurchaseReservation.execute).toHaveBeenCalledWith({
        purchaseReservationId: 'pr-1',
        userId: 'user-1',
      });
    });

    it('キャンセル結果を{ data: { ... } }として返す', async () => {
      const cancelled = { ...mockPRResult, status: 'CANCELLED' };
      cancelPurchaseReservation.execute.mockResolvedValue(cancelled);

      const result = await controller.cancelPurchase('pr-1', currentUser);

      expect(result).toEqual({ data: cancelled });
    });
  });
});
