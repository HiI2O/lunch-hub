import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface InvitationTokenProps {
  readonly token: string;
  readonly expiresAt: Date;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPIRY_HOURS = 48;

export class InvitationToken extends ValueObject<InvitationTokenProps> {
  private constructor(props: InvitationTokenProps) {
    super(props);
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  static create(token?: string, expiresAt?: Date): InvitationToken {
    const tokenValue = token ?? crypto.randomUUID();
    if (!UUID_REGEX.test(tokenValue)) {
      throw new ValidationError(
        `Invalid invitation token format: ${tokenValue}`,
      );
    }
    const expiry =
      expiresAt ?? new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
    return new InvitationToken({ token: tokenValue, expiresAt: expiry });
  }

  isExpired(now: Date = new Date()): boolean {
    return now >= this.props.expiresAt;
  }
}
