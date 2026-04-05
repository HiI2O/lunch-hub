import { TicketSetQuantity } from './ticket-set-quantity.js';

describe('TicketSetQuantity', () => {
  it('1以上の整数で作成できる', () => {
    const qty = TicketSetQuantity.create(3);
    expect(qty.getSets()).toBe(3);
  });

  it('0でエラーを投げる', () => {
    expect(() => TicketSetQuantity.create(0)).toThrow();
  });

  it('負の値でエラーを投げる', () => {
    expect(() => TicketSetQuantity.create(-1)).toThrow();
  });

  it('小数でエラーを投げる', () => {
    expect(() => TicketSetQuantity.create(1.5)).toThrow();
  });

  it('合計枚数を計算できる（1セット=10枚）', () => {
    expect(TicketSetQuantity.create(1).getTotalTickets()).toBe(10);
    expect(TicketSetQuantity.create(3).getTotalTickets()).toBe(30);
  });

  it('等価性を比較できる', () => {
    const a = TicketSetQuantity.create(2);
    const b = TicketSetQuantity.create(2);
    const c = TicketSetQuantity.create(3);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
