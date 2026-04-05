import { Ticket } from './ticket.js';

describe('Ticket', () => {
  const defaultParams = {
    id: 'ticket-001',
    ownerId: 'user-001',
    initialCount: 10,
    purchaseDate: '2026-04-10',
  };

  describe('create', () => {
    it('チケットを作成できる', () => {
      const ticket = Ticket.create(defaultParams);

      expect(ticket.id).toBe('ticket-001');
      expect(ticket.ownerId).toBe('user-001');
      expect(ticket.remainingCount).toBe(10);
      expect(ticket.status.isPending()).toBe(true);
      expect(ticket.purchaseDate).toBe('2026-04-10');
    });

    it('TicketCreatedイベントが発行される', () => {
      const ticket = Ticket.create(defaultParams);
      const events = ticket.getDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TicketCreated');
    });
  });

  describe('use', () => {
    it('1枚使用できる', () => {
      const ticket = Ticket.create(defaultParams);
      ticket.clearDomainEvents();

      ticket.use();

      expect(ticket.remainingCount).toBe(9);
      const events = ticket.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TicketUsed');
    });

    it('残枚数0の場合使用できない', () => {
      const ticket = Ticket.create({ ...defaultParams, initialCount: 0 });

      expect(() => ticket.use()).toThrow('チケット残枚数が不足');
    });
  });

  describe('restoreCount', () => {
    it('1枚返却できる', () => {
      const ticket = Ticket.create(defaultParams);
      ticket.use();
      ticket.clearDomainEvents();

      ticket.restoreCount();

      expect(ticket.remainingCount).toBe(10);
      const events = ticket.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TicketRestored');
    });
  });

  describe('receive', () => {
    it('受取確認できる', () => {
      const ticket = Ticket.create(defaultParams);
      ticket.clearDomainEvents();

      ticket.receive();

      expect(ticket.status.isReceived()).toBe(true);
      const events = ticket.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('TicketReceived');
    });

    it('既に受取済みの場合エラー', () => {
      const ticket = Ticket.create(defaultParams);
      ticket.receive();

      expect(() => ticket.receive()).toThrow('既に受取済み');
    });
  });

  describe('canUse', () => {
    it('残枚数があればtrue', () => {
      const ticket = Ticket.create(defaultParams);
      expect(ticket.canUse()).toBe(true);
    });

    it('残枚数0ならfalse', () => {
      const ticket = Ticket.create({ ...defaultParams, initialCount: 0 });
      expect(ticket.canUse()).toBe(false);
    });
  });

  describe('addCount', () => {
    it('枚数を追加できる', () => {
      const ticket = Ticket.create(defaultParams);
      ticket.addCount(10);
      expect(ticket.remainingCount).toBe(20);
    });
  });

  describe('reconstruct', () => {
    it('永続化データから再構築できる', () => {
      const now = new Date();
      const ticket = Ticket.reconstruct({
        id: 'ticket-001',
        ownerId: 'user-001',
        remainingCount: 8,
        status: 'RECEIVED',
        purchaseDate: '2026-04-10',
        createdAt: now,
        version: 2,
      });

      expect(ticket.id).toBe('ticket-001');
      expect(ticket.remainingCount).toBe(8);
      expect(ticket.status.isReceived()).toBe(true);
      expect(ticket.version).toBe(2);
      expect(ticket.getDomainEvents()).toHaveLength(0);
    });
  });
});
