/* eslint-disable @typescript-eslint/unbound-method */
import { StaffTicketController } from './staff-ticket.controller.js';
import type { ReceiveTicketUseCase } from '../../application/use-cases/receive-ticket.use-case.js';

describe('StaffTicketController', () => {
  let controller: StaffTicketController;
  let receiveTicket: jest.Mocked<ReceiveTicketUseCase>;

  beforeEach(() => {
    receiveTicket = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ReceiveTicketUseCase>;
    controller = new StaffTicketController(receiveTicket);
  });

  describe('POST /staff/tickets/:purchaseReservationId/receive — receive', () => {
    it('ReceiveTicketUseCaseにpurchaseReservationIdを渡して呼び出す', async () => {
      receiveTicket.execute.mockResolvedValue({
        ticketStatus: 'RECEIVED',
        purchaseStatus: 'RECEIVED',
      });

      await controller.receive('pr-1');

      expect(receiveTicket.execute).toHaveBeenCalledWith({
        purchaseReservationId: 'pr-1',
      });
    });

    it('受取確認結果を{ data: { ... } }として返す', async () => {
      const response = {
        ticketStatus: 'RECEIVED',
        purchaseStatus: 'RECEIVED',
      };
      receiveTicket.execute.mockResolvedValue(response);

      const result = await controller.receive('pr-1');

      expect(result).toEqual({ data: response });
    });
  });
});
