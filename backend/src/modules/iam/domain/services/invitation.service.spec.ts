import { InvitationService } from './invitation.service.js';
import { User } from '../aggregates/user.js';
import { EmailAddress } from '../value-objects/email-address.js';
import { DisplayName } from '../value-objects/display-name.js';
import { PasswordHash } from '../value-objects/password-hash.js';
import { Role } from '../value-objects/role.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

describe('InvitationService', () => {
  const service = new InvitationService();

  it('should validate a correct invitation token', () => {
    const user = User.invite({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: EmailAddress.create('test@example.com'),
      role: Role.create('GENERAL_USER'),
      invitedBy: 'admin-id',
    });
    const token = user.invitationToken!.token;

    expect(() => service.validateInvitationToken(user, token)).not.toThrow();
  });

  it('should throw for wrong token', () => {
    const user = User.invite({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: EmailAddress.create('test@example.com'),
      role: Role.create('GENERAL_USER'),
      invitedBy: 'admin-id',
    });

    expect(() => service.validateInvitationToken(user, 'wrong-token')).toThrow(
      ValidationError,
    );
  });

  it('should throw for non-invited user', () => {
    const user = User.invite({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: EmailAddress.create('test@example.com'),
      role: Role.create('GENERAL_USER'),
      invitedBy: 'admin-id',
    });
    user.activate(
      PasswordHash.create(VALID_HASH),
      DisplayName.create('テスト'),
    );

    expect(() => service.validateInvitationToken(user, 'any-token')).toThrow(
      ValidationError,
    );
  });
});
