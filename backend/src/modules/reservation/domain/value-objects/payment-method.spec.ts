import { PaymentMethod, PaymentMethodValues } from './payment-method.js';

describe('PaymentMethod', () => {
  describe('create', () => {
    it('CASHで作成できる', () => {
      const pm = PaymentMethod.create('CASH');
      expect(pm.value).toBe('CASH');
    });

    it('TICKETで作成できる', () => {
      const pm = PaymentMethod.create('TICKET');
      expect(pm.value).toBe('TICKET');
    });

    it('無効な値で作成するとエラーになる', () => {
      expect(() => PaymentMethod.create('INVALID')).toThrow(
        'Invalid payment method',
      );
    });
  });

  describe('振る舞い', () => {
    it('isCash()がCASHの場合trueを返す', () => {
      const pm = PaymentMethod.create('CASH');
      expect(pm.isCash()).toBe(true);
      expect(pm.isTicket()).toBe(false);
    });

    it('isTicket()がTICKETの場合trueを返す', () => {
      const pm = PaymentMethod.create('TICKET');
      expect(pm.isTicket()).toBe(true);
      expect(pm.isCash()).toBe(false);
    });
  });

  describe('equals', () => {
    it('同じ値のPaymentMethodは等しい', () => {
      const a = PaymentMethod.create('CASH');
      const b = PaymentMethod.create('CASH');
      expect(a.equals(b)).toBe(true);
    });

    it('異なる値のPaymentMethodは等しくない', () => {
      const a = PaymentMethod.create('CASH');
      const b = PaymentMethod.create('TICKET');
      expect(a.equals(b)).toBe(false);
    });
  });

  it('PaymentMethodValuesが正しい値を持つ', () => {
    expect(PaymentMethodValues.CASH).toBe('CASH');
    expect(PaymentMethodValues.TICKET).toBe('TICKET');
  });
});
