import type { PasswordResetToken } from '../value-objects/password-reset-token.js';

export interface PasswordResetTokenRecord {
  readonly id: string;
  readonly userId: string;
  readonly token: PasswordResetToken;
}

export abstract class IPasswordResetTokenRepository {
  abstract save(record: PasswordResetTokenRecord): Promise<void>;
  abstract findByToken(token: string): Promise<PasswordResetTokenRecord | null>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
