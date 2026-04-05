import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export class TicketCount {
  private constructor(private readonly _value: number) {}

  static create(value: number): TicketCount {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError(
        'チケット枚数は0以上の整数である必要があります',
      );
    }
    return new TicketCount(value);
  }

  get value(): number {
    return this._value;
  }

  decrement(): TicketCount {
    if (this._value === 0) {
      throw new ValidationError('チケット残枚数が不足しています');
    }
    return new TicketCount(this._value - 1);
  }

  increment(): TicketCount {
    return new TicketCount(this._value + 1);
  }

  add(count: number): TicketCount {
    return TicketCount.create(this._value + count);
  }

  canUse(): boolean {
    return this._value > 0;
  }
}
