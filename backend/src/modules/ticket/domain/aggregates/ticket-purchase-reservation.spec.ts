import { TicketPurchaseReservation } from './ticket-purchase-reservation.js';

describe('TicketPurchaseReservation', () => {
  const defaultParams = {
    id: 'pr-001',
    userId: 'user-001',
    purchaseDate: '2026-04-10',
    quantity: 2,
  };

  describe('create', () => {
    it('購入予約を作成できる', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);

      expect(pr.id).toBe('pr-001');
      expect(pr.userId).toBe('user-001');
      expect(pr.purchaseDate).toBe('2026-04-10');
      expect(pr.quantity.getSets()).toBe(2);
      expect(pr.status.isPending()).toBe(true);
      expect(pr.ticketId).toBeNull();
    });

    it('TicketPurchaseReservationCreatedイベントが発行される', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);
      const events = pr.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TicketPurchaseReservationCreated');
    });
  });

  describe('getTotalTickets', () => {
    it('合計枚数を計算できる', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);
      expect(pr.getTotalTickets()).toBe(20); // 2セット x 10枚
    });
  });

  describe('cancel', () => {
    it('PENDINGの購入予約をキャンセルできる', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);
      pr.clearDomainEvents();

      pr.cancel();

      expect(pr.status.isCancelled()).toBe(true);
      const events = pr.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TicketPurchaseReservationCancelled');
    });

    it('RECEIVED済みの購入予約はキャンセルできない', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);
      pr.receive();

      expect(() => pr.cancel()).toThrow('キャンセルできない');
    });

    it('CANCELLED済みの購入予約はキャンセルできない', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);
      pr.cancel();

      expect(() => pr.cancel()).toThrow('キャンセルできない');
    });
  });

  describe('receive', () => {
    it('受取確認できる', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);
      pr.clearDomainEvents();

      pr.receive();

      expect(pr.status.isReceived()).toBe(true);
    });
  });

  describe('setTicketId', () => {
    it('チケットIDを設定できる', () => {
      const pr = TicketPurchaseReservation.create(defaultParams);
      pr.setTicketId('ticket-001');
      expect(pr.ticketId).toBe('ticket-001');
    });
  });

  describe('reconstruct', () => {
    it('永続化データから再構築できる', () => {
      const now = new Date();
      const pr = TicketPurchaseReservation.reconstruct({
        id: 'pr-001',
        userId: 'user-001',
        purchaseDate: '2026-04-10',
        quantity: 3,
        status: 'RECEIVED',
        ticketId: 'ticket-001',
        createdAt: now,
        version: 1,
      });

      expect(pr.id).toBe('pr-001');
      expect(pr.quantity.getSets()).toBe(3);
      expect(pr.status.isReceived()).toBe(true);
      expect(pr.ticketId).toBe('ticket-001');
      expect(pr.getDomainEvents()).toHaveLength(0);
    });
  });
});
