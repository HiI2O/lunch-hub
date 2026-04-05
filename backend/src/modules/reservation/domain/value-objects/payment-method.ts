import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export const PaymentMethodValues = {
  CASH: 'CASH',
  TICKET: 'TICKET',
} as const;

export type PaymentMethodType =
  (typeof PaymentMethodValues)[keyof typeof PaymentMethodValues];

interface PaymentMethodProps {
  readonly value: PaymentMethodType;
}

export class PaymentMethod extends ValueObject<PaymentMethodProps> {
  private constructor(props: PaymentMethodProps) {
    super(props);
  }

  get value(): PaymentMethodType {
    return this.props.value;
  }

  static create(value: string): PaymentMethod {
    if (
      !Object.values(PaymentMethodValues).includes(value as PaymentMethodType)
    ) {
      throw new ValidationError(`Invalid payment method: ${value}`);
    }
    return new PaymentMethod({ value: value as PaymentMethodType });
  }

  isCash(): boolean {
    return this.props.value === PaymentMethodValues.CASH;
  }

  isTicket(): boolean {
    return this.props.value === PaymentMethodValues.TICKET;
  }
}
