import { Order } from './order.js';

describe('Order', () => {
  const defaultParams = {
    id: 'order-001',
    orderDate: '2026-04-10',
    reservationIds: ['r1', 'r2', 'r3'],
  };

  describe('create', () => {
    it('注文を作成できる', () => {
      const order = Order.create(defaultParams);

      expect(order.id).toBe('order-001');
      expect(order.orderDate).toBe('2026-04-10');
      expect(order.reservationIds).toEqual(['r1', 'r2', 'r3']);
      expect(order.totalCount).toBe(3);
      expect(order.status.isPending()).toBe(true);
    });

    it('空の予約リストでエラーを投げる', () => {
      expect(() =>
        Order.create({ ...defaultParams, reservationIds: [] }),
      ).toThrow('予約が1つ以上');
    });
  });

  describe('placeOrder', () => {
    it('注文を確定できる', () => {
      const order = Order.create(defaultParams);
      order.clearDomainEvents();

      order.placeOrder();

      expect(order.status.isPlaced()).toBe(true);
      const events = order.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('OrderPlaced');
    });

    it('既にPLACEDの注文は確定できない', () => {
      const order = Order.create(defaultParams);
      order.placeOrder();

      expect(() => order.placeOrder()).toThrow('変更できない');
    });
  });

  describe('canModify', () => {
    it('PENDINGはtrue', () => {
      expect(Order.create(defaultParams).canModify()).toBe(true);
    });

    it('PLACEDはfalse', () => {
      const order = Order.create(defaultParams);
      order.placeOrder();
      expect(order.canModify()).toBe(false);
    });
  });

  describe('reconstruct', () => {
    it('永続化データから再構築できる', () => {
      const now = new Date();
      const order = Order.reconstruct({
        id: 'order-001',
        orderDate: '2026-04-10',
        reservationIds: ['r1', 'r2'],
        status: 'PLACED',
        totalCount: 2,
        createdAt: now,
        placedAt: now,
        version: 1,
      });

      expect(order.status.isPlaced()).toBe(true);
      expect(order.totalCount).toBe(2);
      expect(order.getDomainEvents()).toHaveLength(0);
    });
  });
});
