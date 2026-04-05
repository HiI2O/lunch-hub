import { OrderMapper } from './order.mapper.js';
import { Order } from '../../domain/aggregates/order.js';
import type { OrderEntity } from '../persistence/entities/order.entity.js';

describe('OrderMapper', () => {
  let mapper: OrderMapper;

  beforeEach(() => {
    mapper = new OrderMapper();
  });

  describe('toDomain', () => {
    it('OrderEntity → Orderドメインオブジェクトに変換される', () => {
      const entity = {
        id: 'order-1',
        order_date: '2026-04-05',
        reservation_ids: ['res-1', 'res-2'],
        status: 'PENDING',
        total_count: 2,
        created_at: new Date('2026-04-05T00:00:00Z'),
        placed_at: null,
        version: 0,
      } as OrderEntity;

      const result = mapper.toDomain(entity);

      expect(result).toBeInstanceOf(Order);
      expect(result.id).toBe('order-1');
      expect(result.orderDate).toBe('2026-04-05');
      expect(result.reservationIds).toEqual(['res-1', 'res-2']);
      expect(result.status.value).toBe('PENDING');
      expect(result.totalCount).toBe(2);
      expect(result.placedAt).toBeNull();
    });

    it('placed_atがnullの場合も正しく変換される（PENDING状態）', () => {
      const entity = {
        id: 'order-1',
        order_date: '2026-04-05',
        reservation_ids: ['res-1'],
        status: 'PENDING',
        total_count: 1,
        created_at: new Date('2026-04-05T00:00:00Z'),
        placed_at: null,
        version: 0,
      } as OrderEntity;

      const result = mapper.toDomain(entity);

      expect(result.placedAt).toBeNull();
    });

    it('placed_atが設定されている場合も正しく変換される', () => {
      const placedAt = new Date('2026-04-05T09:00:00Z');
      const entity = {
        id: 'order-1',
        order_date: '2026-04-05',
        reservation_ids: ['res-1'],
        status: 'PLACED',
        total_count: 1,
        created_at: new Date('2026-04-05T00:00:00Z'),
        placed_at: placedAt,
        version: 1,
      } as OrderEntity;

      const result = mapper.toDomain(entity);

      expect(result.placedAt).toEqual(placedAt);
    });
  });

  describe('toPersistence', () => {
    it('Order → Partial<OrderEntity>に変換される', () => {
      const order = Order.reconstruct({
        id: 'order-1',
        orderDate: '2026-04-05',
        reservationIds: ['res-1', 'res-2'],
        status: 'PENDING',
        totalCount: 2,
        createdAt: new Date('2026-04-05T00:00:00Z'),
        placedAt: null,
        version: 0,
      });

      const result = mapper.toPersistence(order);

      expect(result.id).toBe('order-1');
      expect(result.order_date).toBe('2026-04-05');
      expect(result.reservation_ids).toEqual(['res-1', 'res-2']);
      expect(result.status).toBe('PENDING');
      expect(result.total_count).toBe(2);
      expect(result.placed_at).toBeNull();
    });

    it('reservationIdsはスプレッド演算子で新しい配列にコピーされる（イミュータビリティ）', () => {
      const order = Order.reconstruct({
        id: 'order-1',
        orderDate: '2026-04-05',
        reservationIds: ['res-1'],
        status: 'PENDING',
        totalCount: 1,
        createdAt: new Date('2026-04-05T00:00:00Z'),
        placedAt: null,
        version: 0,
      });

      const result = mapper.toPersistence(order);

      expect(result.reservation_ids).not.toBe(order.reservationIds);
      expect(result.reservation_ids).toEqual([...order.reservationIds]);
    });
  });
});
