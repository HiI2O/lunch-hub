import { TicketCount } from './ticket-count.js';

describe('TicketCount', () => {
  it('0以上の値で作成できる', () => {
    const count = TicketCount.create(10);
    expect(count.value).toBe(10);
  });

  it('0で作成できる', () => {
    const count = TicketCount.create(0);
    expect(count.value).toBe(0);
  });

  it('負の値でエラーを投げる', () => {
    expect(() => TicketCount.create(-1)).toThrow();
  });

  it('小数でエラーを投げる', () => {
    expect(() => TicketCount.create(1.5)).toThrow();
  });

  it('decrementで1枚減らせる', () => {
    const count = TicketCount.create(5);
    const decremented = count.decrement();
    expect(decremented.value).toBe(4);
    expect(count.value).toBe(5); // イミュータブル
  });

  it('0枚の場合decrementでエラーを投げる', () => {
    const count = TicketCount.create(0);
    expect(() => count.decrement()).toThrow('チケット残枚数が不足');
  });

  it('incrementで1枚増やせる', () => {
    const count = TicketCount.create(3);
    const incremented = count.increment();
    expect(incremented.value).toBe(4);
  });

  it('addで指定枚数を追加できる', () => {
    const count = TicketCount.create(5);
    const added = count.add(10);
    expect(added.value).toBe(15);
  });

  it('canUseは残枚数が1以上でtrueを返す', () => {
    expect(TicketCount.create(1).canUse()).toBe(true);
    expect(TicketCount.create(0).canUse()).toBe(false);
  });
});
