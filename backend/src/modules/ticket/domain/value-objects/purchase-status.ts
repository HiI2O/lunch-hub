import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const PURCHASE_STATUS_VALUES = ['PENDING', 'RECEIVED', 'CANCELLED'] as const;
type PurchaseStatusValue = (typeof PURCHASE_STATUS_VALUES)[number];

export class PurchaseStatus {
  private constructor(private readonly _value: PurchaseStatusValue) {}

  static create(value: string): PurchaseStatus {
    if (!PURCHASE_STATUS_VALUES.includes(value as PurchaseStatusValue)) {
      throw new ValidationError(`不正な購入ステータス: ${value}`);
    }
    return new PurchaseStatus(value as PurchaseStatusValue);
  }

  get value(): string {
    return this._value;
  }

  isPending(): boolean {
    return this._value === 'PENDING';
  }

  isReceived(): boolean {
    return this._value === 'RECEIVED';
  }

  isCancelled(): boolean {
    return this._value === 'CANCELLED';
  }

  canCancel(): boolean {
    return this._value === 'PENDING';
  }
}
