import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface SessionProps {
  readonly userId: string;
  readonly refreshToken: string;
  readonly isRevoked: boolean;
  readonly createdAt: Date;
  readonly lastAccessedAt: Date;
  readonly expiresAt: Date;
}

interface CreateParams {
  readonly id: string;
  readonly userId: string;
  readonly refreshToken: string;
  readonly expiresAt: Date;
}

interface ReconstructParams {
  readonly id: string;
  readonly userId: string;
  readonly refreshToken: string;
  readonly isRevoked: boolean;
  readonly createdAt: Date;
  readonly lastAccessedAt: Date;
  readonly expiresAt: Date;
}

export class Session extends AggregateRoot<string> {
  private _props: SessionProps;

  private constructor(id: string, props: SessionProps) {
    super(id);
    this._props = props;
  }

  get userId(): string {
    return this._props.userId;
  }
  get refreshToken(): string {
    return this._props.refreshToken;
  }
  get isRevoked(): boolean {
    return this._props.isRevoked;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get lastAccessedAt(): Date {
    return this._props.lastAccessedAt;
  }
  get expiresAt(): Date {
    return this._props.expiresAt;
  }

  static create(params: CreateParams): Session {
    const now = new Date();
    return new Session(params.id, {
      userId: params.userId,
      refreshToken: params.refreshToken,
      isRevoked: false,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: params.expiresAt,
    });
  }

  static reconstruct(params: ReconstructParams): Session {
    return new Session(params.id, {
      userId: params.userId,
      refreshToken: params.refreshToken,
      isRevoked: params.isRevoked,
      createdAt: params.createdAt,
      lastAccessedAt: params.lastAccessedAt,
      expiresAt: params.expiresAt,
    });
  }

  revoke(): void {
    if (this._props.isRevoked) {
      throw new ValidationError('Session is already revoked');
    }
    this._props = {
      ...this._props,
      isRevoked: true,
    };
  }

  updateLastAccessed(): void {
    if (this._props.isRevoked) {
      throw new ValidationError('Cannot update revoked session');
    }
    this._props = {
      ...this._props,
      lastAccessedAt: new Date(),
    };
  }

  isValid(now: Date = new Date()): boolean {
    return !this._props.isRevoked && now < this._props.expiresAt;
  }

  isExpired(now: Date = new Date()): boolean {
    return now >= this._props.expiresAt;
  }
}
