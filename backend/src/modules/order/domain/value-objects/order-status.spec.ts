import { OrderStatus } from './order-status.js';

describe('OrderStatus', () => {
  it.each(['PENDING', 'PLACED'] as const)('%s を作成できる', (val) => {
    const status = OrderStatus.create(val);
    expect(status.value).toBe(val);
  });

  it('不正な値でエラーを投げる', () => {
    expect(() => OrderStatus.create('INVALID' as never)).toThrow();
  });

  it('isPendingが正しく判定される', () => {
    expect(OrderStatus.create('PENDING').isPending()).toBe(true);
    expect(OrderStatus.create('PLACED').isPending()).toBe(false);
  });

  it('canModifyはPENDINGのみtrue', () => {
    expect(OrderStatus.create('PENDING').canModify()).toBe(true);
    expect(OrderStatus.create('PLACED').canModify()).toBe(false);
  });
});
