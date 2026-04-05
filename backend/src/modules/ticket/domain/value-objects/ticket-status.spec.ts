import { TicketStatus } from './ticket-status.js';

describe('TicketStatus', () => {
  it('PENDINGを作成できる', () => {
    const status = TicketStatus.create('PENDING');
    expect(status.isPending()).toBe(true);
    expect(status.isReceived()).toBe(false);
  });

  it('RECEIVEDを作成できる', () => {
    const status = TicketStatus.create('RECEIVED');
    expect(status.isPending()).toBe(false);
    expect(status.isReceived()).toBe(true);
  });

  it('不正な値でエラーを投げる', () => {
    expect(() => TicketStatus.create('INVALID' as never)).toThrow();
  });

  it('値を文字列で取得できる', () => {
    expect(TicketStatus.create('PENDING').value).toBe('PENDING');
  });

  it('等価性を比較できる', () => {
    const a = TicketStatus.create('PENDING');
    const b = TicketStatus.create('PENDING');
    const c = TicketStatus.create('RECEIVED');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
