import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export const ReservationStatusValues = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  FINALIZED: 'FINALIZED',
} as const;

export type ReservationStatusType =
  (typeof ReservationStatusValues)[keyof typeof ReservationStatusValues];

interface ReservationStatusProps {
  readonly value: ReservationStatusType;
}

export class ReservationStatus extends ValueObject<ReservationStatusProps> {
  private constructor(props: ReservationStatusProps) {
    super(props);
  }

  get value(): ReservationStatusType {
    return this.props.value;
  }

  static create(value: string): ReservationStatus {
    if (
      !Object.values(ReservationStatusValues).includes(
        value as ReservationStatusType,
      )
    ) {
      throw new ValidationError(`Invalid reservation status: ${value}`);
    }
    return new ReservationStatus({ value: value as ReservationStatusType });
  }

  isConfirmed(): boolean {
    return this.props.value === ReservationStatusValues.CONFIRMED;
  }

  isCancelled(): boolean {
    return this.props.value === ReservationStatusValues.CANCELLED;
  }

  isFinalized(): boolean {
    return this.props.value === ReservationStatusValues.FINALIZED;
  }

  canModify(): boolean {
    return this.isConfirmed();
  }
}
