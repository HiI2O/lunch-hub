import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface PasswordResetTokenProps {
  readonly token: string;
  readonly expiresAt: Date;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPIRY_HOURS = 1;

export class PasswordResetToken extends ValueObject<PasswordResetTokenProps> {
  private constructor(props: PasswordResetTokenProps) {
    super(props);
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  static create(token?: string, expiresAt?: Date): PasswordResetToken {
    const tokenValue = token ?? crypto.randomUUID();
    if (!UUID_REGEX.test(tokenValue)) {
      throw new ValidationError(
        `Invalid password reset token format: ${tokenValue}`,
      );
    }
    const expiry =
      expiresAt ?? new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
    return new PasswordResetToken({ token: tokenValue, expiresAt: expiry });
  }

  isExpired(now: Date = new Date()): boolean {
    return now >= this.props.expiresAt;
  }
}
