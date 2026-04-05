import { Reservation } from './reservation.js';
import { PaymentMethod } from '../value-objects/payment-method.js';

describe('Reservation', () => {
  const defaultParams = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '660e8400-e29b-41d4-a716-446655440001',
    reservationDate: '2026-04-10',
    paymentMethod: PaymentMethod.create('CASH'),
  };

  describe('create', () => {
    it('予約を作成できる', () => {
      const reservation = Reservation.create(defaultParams);

      expect(reservation.id).toBe(defaultParams.id);
      expect(reservation.userId).toBe(defaultParams.userId);
      expect(reservation.reservationDate).toBe('2026-04-10');
      expect(reservation.paymentMethod.isCash()).toBe(true);
      expect(reservation.status.isConfirmed()).toBe(true);
      expect(reservation.ticketId).toBeNull();
      expect(reservation.orderId).toBeNull();
      expect(reservation.guestId).toBeNull();
    });

    it('チケット払いの場合ticketIdが設定される', () => {
      const reservation = Reservation.create({
        ...defaultParams,
        paymentMethod: PaymentMethod.create('TICKET'),
        ticketId: 'ticket-id-123',
      });

      expect(reservation.paymentMethod.isTicket()).toBe(true);
      expect(reservation.ticketId).toBe('ticket-id-123');
    });

    it('ゲスト予約の場合guestIdが設定される', () => {
      const reservation = Reservation.create({
        ...defaultParams,
        guestId: 'guest-id-123',
      });

      expect(reservation.guestId).toBe('guest-id-123');
    });

    it('ReservationCreatedイベントが発行される', () => {
      const reservation = Reservation.create(defaultParams);
      const events = reservation.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('ReservationCreated');
    });
  });

  describe('cancel', () => {
    it('CONFIRMEDの予約をキャンセルできる', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.clearDomainEvents();

      reservation.cancel();

      expect(reservation.status.isCancelled()).toBe(true);
      const events = reservation.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('ReservationCancelled');
    });

    it('CANCELLED済みの予約はキャンセルできない', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.cancel();

      expect(() => reservation.cancel()).toThrow('変更できない予約');
    });

    it('FINALIZEDの予約はキャンセルできない', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.finalize('order-id');

      expect(() => reservation.cancel()).toThrow('変更できない予約');
    });
  });

  describe('changePaymentMethod', () => {
    it('支払い方法を変更できる', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.clearDomainEvents();

      const newMethod = PaymentMethod.create('TICKET');
      reservation.changePaymentMethod(newMethod, 'ticket-id');

      expect(reservation.paymentMethod.isTicket()).toBe(true);
      expect(reservation.ticketId).toBe('ticket-id');
      const events = reservation.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('ReservationModified');
    });

    it('TICKET→CASHに変更するとticketIdがnullになる', () => {
      const reservation = Reservation.create({
        ...defaultParams,
        paymentMethod: PaymentMethod.create('TICKET'),
        ticketId: 'ticket-id',
      });

      reservation.changePaymentMethod(PaymentMethod.create('CASH'));

      expect(reservation.paymentMethod.isCash()).toBe(true);
      expect(reservation.ticketId).toBeNull();
    });

    it('CANCELLED済みの予約は変更できない', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.cancel();

      expect(() =>
        reservation.changePaymentMethod(PaymentMethod.create('TICKET'), 'tid'),
      ).toThrow('変更できない予約');
    });
  });

  describe('finalize', () => {
    it('CONFIRMEDの予約を確定できる', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.clearDomainEvents();

      reservation.finalize('order-id-123');

      expect(reservation.status.isFinalized()).toBe(true);
      expect(reservation.orderId).toBe('order-id-123');
      const events = reservation.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('ReservationFinalized');
    });

    it('CANCELLED済みの予約は確定できない', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.cancel();

      expect(() => reservation.finalize('order-id')).toThrow(
        '変更できない予約',
      );
    });
  });

  describe('canModify', () => {
    it('CONFIRMEDの予約はtrueを返す', () => {
      const reservation = Reservation.create(defaultParams);
      expect(reservation.canModify()).toBe(true);
    });

    it('CANCELLEDの予約はfalseを返す', () => {
      const reservation = Reservation.create(defaultParams);
      reservation.cancel();
      expect(reservation.canModify()).toBe(false);
    });
  });

  describe('reconstruct', () => {
    it('永続化されたデータから再構築できる', () => {
      const now = new Date();
      const reservation = Reservation.reconstruct({
        id: defaultParams.id,
        userId: defaultParams.userId,
        reservationDate: '2026-04-10',
        paymentMethod: 'CASH',
        status: 'CONFIRMED',
        ticketId: null,
        orderId: null,
        guestId: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      });

      expect(reservation.id).toBe(defaultParams.id);
      expect(reservation.paymentMethod.isCash()).toBe(true);
      expect(reservation.status.isConfirmed()).toBe(true);
      expect(reservation.version).toBe(1);
      expect(reservation.getDomainEvents()).toHaveLength(0);
    });
  });
});
