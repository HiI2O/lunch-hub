import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const ORDER_STATUS_VALUES = ['PENDING', 'PLACED'] as const;
type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];

export class OrderStatus {
  private constructor(private readonly _value: OrderStatusValue) {}

  static create(value: string): OrderStatus {
    if (!ORDER_STATUS_VALUES.includes(value as OrderStatusValue)) {
      throw new ValidationError(`不正な注文ステータス: ${value}`);
    }
    return new OrderStatus(value as OrderStatusValue);
  }

  get value(): string {
    return this._value;
  }

  isPending(): boolean {
    return this._value === 'PENDING';
  }

  isPlaced(): boolean {
    return this._value === 'PLACED';
  }

  canModify(): boolean {
    return this._value === 'PENDING';
  }
}
