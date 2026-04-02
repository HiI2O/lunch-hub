import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface PasswordHashProps {
  readonly value: string;
}

const BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

export class PasswordHash extends ValueObject<PasswordHashProps> {
  private constructor(props: PasswordHashProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(hash: string): PasswordHash {
    if (!BCRYPT_REGEX.test(hash)) {
      throw new ValidationError('Invalid bcrypt hash format');
    }
    return new PasswordHash({ value: hash });
  }
}
