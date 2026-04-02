import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface EmailAddressProps {
  readonly value: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAddress extends ValueObject<EmailAddressProps> {
  private constructor(props: EmailAddressProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(email: string): EmailAddress {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new ValidationError(`Invalid email format: ${email}`);
    }
    return new EmailAddress({ value: normalized });
  }
}
