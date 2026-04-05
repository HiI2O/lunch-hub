import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const TICKETS_PER_SET = 10;

export class TicketSetQuantity {
  private constructor(private readonly _sets: number) {}

  static create(sets: number): TicketSetQuantity {
    if (!Number.isInteger(sets) || sets < 1) {
      throw new ValidationError(
        'チケットセット数は1以上の整数である必要があります',
      );
    }
    return new TicketSetQuantity(sets);
  }

  getSets(): number {
    return this._sets;
  }

  getTotalTickets(): number {
    return this._sets * TICKETS_PER_SET;
  }

  equals(other: TicketSetQuantity): boolean {
    return this._sets === other._sets;
  }
}
