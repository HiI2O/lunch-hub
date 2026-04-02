import { Injectable } from '@nestjs/common';
import { UserEntity } from '../persistence/entities/user.entity.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { InvitationToken } from '../../domain/value-objects/invitation-token.js';

@Injectable()
export class UserMapper {
  toDomain(entity: UserEntity): User {
    return User.reconstruct({
      id: entity.id,
      email: EmailAddress.create(entity.email),
      displayName: entity.display_name
        ? DisplayName.create(entity.display_name)
        : null,
      passwordHash: entity.password_hash
        ? PasswordHash.create(entity.password_hash)
        : null,
      role: Role.create(entity.role),
      status: UserStatus.create(entity.status),
      invitationToken:
        entity.invitation_token !== null &&
        entity.invitation_token_expires_at !== null
          ? InvitationToken.create(
              entity.invitation_token,
              entity.invitation_token_expires_at,
            )
          : null,
      invitedBy: entity.invited_by,
      invitedAt: entity.invited_at,
      activatedAt: entity.activated_at,
      lastLoginAt: entity.last_login_at,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      version: entity.version,
    });
  }

  toPersistence(user: User): Partial<UserEntity> {
    return {
      id: user.id,
      email: user.email.value,
      display_name: user.displayName?.value ?? null,
      password_hash: user.passwordHash?.value ?? null,
      role: user.role.value,
      status: user.status.value,
      invitation_token: user.invitationToken?.token ?? null,
      invitation_token_expires_at: user.invitationToken?.expiresAt ?? null,
      invited_by: user.invitedBy,
      invited_at: user.invitedAt,
      activated_at: user.activatedAt,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      version: user.version,
    };
  }
}
