import { PurchaseStatus } from './purchase-status.js';

describe('PurchaseStatus', () => {
  it.each(['PENDING', 'RECEIVED', 'CANCELLED'] as const)(
    '%s を作成できる',
    (val) => {
      const status = PurchaseStatus.create(val);
      expect(status.value).toBe(val);
    },
  );

  it('不正な値でエラーを投げる', () => {
    expect(() => PurchaseStatus.create('INVALID' as never)).toThrow();
  });

  it('isPendingが正しく判定される', () => {
    expect(PurchaseStatus.create('PENDING').isPending()).toBe(true);
    expect(PurchaseStatus.create('RECEIVED').isPending()).toBe(false);
  });

  it('canCancelはPENDINGのみtrue', () => {
    expect(PurchaseStatus.create('PENDING').canCancel()).toBe(true);
    expect(PurchaseStatus.create('RECEIVED').canCancel()).toBe(false);
    expect(PurchaseStatus.create('CANCELLED').canCancel()).toBe(false);
  });
});
