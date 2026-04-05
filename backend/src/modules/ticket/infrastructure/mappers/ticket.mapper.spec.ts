import { TicketMapper } from './ticket.mapper.js';
import { Ticket } from '../../domain/aggregates/ticket.js';
import type { TicketEntity } from '../persistence/entities/ticket.entity.js';

describe('TicketMapper', () => {
  let mapper: TicketMapper;

  beforeEach(() => {
    mapper = new TicketMapper();
  });

  describe('toDomain', () => {
    it('TicketEntity → Ticketドメインオブジェクトに変換される', () => {
      const entity = {
        id: 'ticket-1',
        owner_id: 'user-1',
        remaining_count: 10,
        status: 'PENDING',
        purchase_date: '2026-04-05',
        created_at: new Date('2026-04-05T00:00:00Z'),
        version: 1,
      } as TicketEntity;

      const result = mapper.toDomain(entity);

      expect(result).toBeInstanceOf(Ticket);
      expect(result.id).toBe('ticket-1');
      expect(result.ownerId).toBe('user-1');
      expect(result.remainingCount).toBe(10);
      expect(result.status.value).toBe('PENDING');
      expect(result.purchaseDate).toBe('2026-04-05');
    });
  });

  describe('toPersistence', () => {
    it('Ticket → Partial<TicketEntity>に変換される', () => {
      const ticket = Ticket.reconstruct({
        id: 'ticket-1',
        ownerId: 'user-1',
        remainingCount: 10,
        status: 'PENDING',
        purchaseDate: '2026-04-05',
        createdAt: new Date('2026-04-05T00:00:00Z'),
        version: 1,
      });

      const result = mapper.toPersistence(ticket);

      expect(result.id).toBe('ticket-1');
      expect(result.owner_id).toBe('user-1');
      expect(result.remaining_count).toBe(10);
      expect(result.status).toBe('PENDING');
      expect(result.purchase_date).toBe('2026-04-05');
    });
  });
});
