import { TicketPurchaseReservationMapper } from './ticket-purchase-reservation.mapper.js';
import { TicketPurchaseReservation } from '../../domain/aggregates/ticket-purchase-reservation.js';
import type { TicketPurchaseReservationEntity } from '../persistence/entities/ticket-purchase-reservation.entity.js';

describe('TicketPurchaseReservationMapper', () => {
  let mapper: TicketPurchaseReservationMapper;

  beforeEach(() => {
    mapper = new TicketPurchaseReservationMapper();
  });

  describe('toDomain', () => {
    it('TicketPurchaseReservationEntity → TicketPurchaseReservationドメインオブジェクトに変換される', () => {
      const entity = {
        id: 'pr-1',
        user_id: 'user-1',
        purchase_date: '2026-04-05',
        quantity: 2,
        status: 'PENDING',
        ticket_id: null,
        created_at: new Date('2026-04-05T00:00:00Z'),
        version: 0,
      } as TicketPurchaseReservationEntity;

      const result = mapper.toDomain(entity);

      expect(result).toBeInstanceOf(TicketPurchaseReservation);
      expect(result.id).toBe('pr-1');
      expect(result.userId).toBe('user-1');
      expect(result.purchaseDate).toBe('2026-04-05');
      expect(result.quantity.getSets()).toBe(2);
      expect(result.status.value).toBe('PENDING');
      expect(result.ticketId).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('TicketPurchaseReservation → Partial<TicketPurchaseReservationEntity>に変換される', () => {
      const pr = TicketPurchaseReservation.reconstruct({
        id: 'pr-1',
        userId: 'user-1',
        purchaseDate: '2026-04-05',
        quantity: 2,
        status: 'PENDING',
        ticketId: null,
        createdAt: new Date('2026-04-05T00:00:00Z'),
        version: 0,
      });

      const result = mapper.toPersistence(pr);

      expect(result.id).toBe('pr-1');
      expect(result.user_id).toBe('user-1');
      expect(result.purchase_date).toBe('2026-04-05');
      expect(result.quantity).toBe(2);
      expect(result.status).toBe('PENDING');
      expect(result.ticket_id).toBeNull();
    });

    it('ticketIdが設定されている場合も正しく変換される', () => {
      const pr = TicketPurchaseReservation.reconstruct({
        id: 'pr-1',
        userId: 'user-1',
        purchaseDate: '2026-04-05',
        quantity: 1,
        status: 'RECEIVED',
        ticketId: 'ticket-1',
        createdAt: new Date('2026-04-05T00:00:00Z'),
        version: 1,
      });

      const result = mapper.toPersistence(pr);

      expect(result.ticket_id).toBe('ticket-1');
    });
  });
});
