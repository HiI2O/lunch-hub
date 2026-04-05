import { ReservationMapper } from './reservation.mapper.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';
import type { ReservationEntity } from '../persistence/entities/reservation.entity.js';

describe('ReservationMapper', () => {
  const mapper = new ReservationMapper();

  describe('toDomain', () => {
    it('エンティティからドメインオブジェクトに変換できる', () => {
      const entity: ReservationEntity = {
        id: 'r-1',
        user_id: 'u-1',
        guest_id: null,
        reservation_date: '2026-04-10',
        payment_method: 'CASH',
        status: 'CONFIRMED',
        ticket_id: null,
        order_id: null,
        created_at: new Date('2026-04-01'),
        updated_at: new Date('2026-04-01'),
        version: 1,
      };

      const domain = mapper.toDomain(entity);

      expect(domain.id).toBe('r-1');
      expect(domain.userId).toBe('u-1');
      expect(domain.paymentMethod.isCash()).toBe(true);
      expect(domain.status.isConfirmed()).toBe(true);
      expect(domain.version).toBe(1);
    });
  });

  describe('toPersistence', () => {
    it('ドメインオブジェクトからエンティティに変換できる', () => {
      const reservation = Reservation.create({
        id: 'r-2',
        userId: 'u-2',
        reservationDate: '2026-04-15',
        paymentMethod: PaymentMethod.create('TICKET'),
        ticketId: 't-1',
      });

      const entity = mapper.toPersistence(reservation);

      expect(entity.id).toBe('r-2');
      expect(entity.user_id).toBe('u-2');
      expect(entity.reservation_date).toBe('2026-04-15');
      expect(entity.payment_method).toBe('TICKET');
      expect(entity.status).toBe('CONFIRMED');
      expect(entity.ticket_id).toBe('t-1');
    });
  });
});
