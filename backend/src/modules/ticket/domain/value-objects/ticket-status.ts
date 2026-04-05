import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const TICKET_STATUS_VALUES = ['PENDING', 'RECEIVED'] as const;
type TicketStatusValue = (typeof TICKET_STATUS_VALUES)[number];

export class TicketStatus {
  private constructor(private readonly _value: TicketStatusValue) {}

  static create(value: string): TicketStatus {
    if (!TICKET_STATUS_VALUES.includes(value as TicketStatusValue)) {
      throw new ValidationError(`不正なチケットステータス: ${value}`);
    }
    return new TicketStatus(value as TicketStatusValue);
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

  equals(other: TicketStatus): boolean {
    return this._value === other._value;
  }
}
