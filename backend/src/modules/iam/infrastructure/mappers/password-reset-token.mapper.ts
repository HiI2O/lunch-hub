import { Injectable } from '@nestjs/common';
import { PasswordResetTokenEntity } from '../persistence/entities/password-reset-token.entity.js';
import { PasswordResetToken } from '../../domain/value-objects/password-reset-token.js';
import type { PasswordResetTokenRecord } from '../../domain/repositories/password-reset-token.repository.js';

@Injectable()
export class PasswordResetTokenMapper {
  toDomain(entity: PasswordResetTokenEntity): PasswordResetTokenRecord {
    return {
      id: entity.id,
      userId: entity.user_id,
      token: PasswordResetToken.create(entity.token, entity.expires_at),
    };
  }

  toPersistence(
    record: PasswordResetTokenRecord,
  ): Partial<PasswordResetTokenEntity> {
    return {
      id: record.id,
      user_id: record.userId,
      token: record.token.token,
      expires_at: record.token.expiresAt,
    };
  }
}
