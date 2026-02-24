import { UserMapper } from './user.mapper.js';
import { UserEntity } from '../persistence/entities/user.entity.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { InvitationToken } from '../../domain/value-objects/invitation-token.js';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  describe('toDomain', () => {
    it('should convert a full UserEntity to a domain User aggregate', () => {
      const entity = new UserEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.email = 'test@example.com';
      entity.display_name = 'Test User';
      entity.password_hash =
        '$2b$12$LJ3m4ys3Lg7MNA18xjSYMuOYKbLBRlTzOkMFpEROVRBXaYsHG7vXa';
      entity.role = 'GENERAL_USER';
      entity.status = 'ACTIVE';
      entity.invitation_token = null;
      entity.invitation_token_expires_at = null;
      entity.invited_by = '660e8400-e29b-41d4-a716-446655440000';
      entity.invited_at = new Date('2025-01-01T00:00:00Z');
      entity.activated_at = new Date('2025-01-02T00:00:00Z');
      entity.last_login_at = new Date('2025-01-03T00:00:00Z');
      entity.created_at = new Date('2025-01-01T00:00:00Z');
      entity.updated_at = new Date('2025-01-03T00:00:00Z');
      entity.version = 3;

      const user = mapper.toDomain(entity);

      expect(user.id).toBe(entity.id);
      expect(user.email.value).toBe('test@example.com');
      expect(user.displayName?.value).toBe('Test User');
      expect(user.passwordHash?.value).toBe(entity.password_hash);
      expect(user.role.value).toBe('GENERAL_USER');
      expect(user.status.value).toBe('ACTIVE');
      expect(user.invitationToken).toBeNull();
      expect(user.invitedBy).toBe(entity.invited_by);
      expect(user.invitedAt).toEqual(entity.invited_at);
      expect(user.activatedAt).toEqual(entity.activated_at);
      expect(user.lastLoginAt).toEqual(entity.last_login_at);
      expect(user.createdAt).toEqual(entity.created_at);
      expect(user.updatedAt).toEqual(entity.updated_at);
      expect(user.version).toBe(3);
    });

    it('should handle nullable fields correctly', () => {
      const entity = new UserEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.email = 'invited@example.com';
      entity.display_name = null;
      entity.password_hash = null;
      entity.role = 'GENERAL_USER';
      entity.status = 'INVITED';
      entity.invitation_token = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      entity.invitation_token_expires_at = new Date('2025-12-31T23:59:59Z');
      entity.invited_by = null;
      entity.invited_at = null;
      entity.activated_at = null;
      entity.last_login_at = null;
      entity.created_at = new Date('2025-01-01T00:00:00Z');
      entity.updated_at = new Date('2025-01-01T00:00:00Z');
      entity.version = 0;

      const user = mapper.toDomain(entity);

      expect(user.displayName).toBeNull();
      expect(user.passwordHash).toBeNull();
      expect(user.invitationToken).not.toBeNull();
      expect(user.invitationToken?.token).toBe(entity.invitation_token);
      expect(user.invitedBy).toBeNull();
      expect(user.invitedAt).toBeNull();
      expect(user.activatedAt).toBeNull();
      expect(user.lastLoginAt).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('should convert a domain User to a persistence object', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const user = User.reconstruct({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        displayName: DisplayName.create('Test User'),
        passwordHash: PasswordHash.create(
          '$2b$12$LJ3m4ys3Lg7MNA18xjSYMuOYKbLBRlTzOkMFpEROVRBXaYsHG7vXa',
        ),
        role: Role.create('ADMINISTRATOR'),
        status: UserStatus.create('ACTIVE'),
        invitationToken: null,
        invitedBy: '660e8400-e29b-41d4-a716-446655440000',
        invitedAt: now,
        activatedAt: now,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        version: 2,
      });

      const persistence = mapper.toPersistence(user);

      expect(persistence.id).toBe(user.id);
      expect(persistence.email).toBe('test@example.com');
      expect(persistence.display_name).toBe('Test User');
      expect(persistence.password_hash).toBe(
        '$2b$12$LJ3m4ys3Lg7MNA18xjSYMuOYKbLBRlTzOkMFpEROVRBXaYsHG7vXa',
      );
      expect(persistence.role).toBe('ADMINISTRATOR');
      expect(persistence.status).toBe('ACTIVE');
      expect(persistence.invitation_token).toBeNull();
      expect(persistence.invitation_token_expires_at).toBeNull();
      expect(persistence.invited_by).toBe(
        '660e8400-e29b-41d4-a716-446655440000',
      );
      expect(persistence.invited_at).toEqual(now);
      expect(persistence.activated_at).toEqual(now);
      expect(persistence.last_login_at).toEqual(now);
      expect(persistence.created_at).toEqual(now);
      expect(persistence.updated_at).toEqual(now);
      expect(persistence.version).toBe(2);
    });

    it('should map nullable fields to null', () => {
      const invitationToken = InvitationToken.create(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        new Date('2025-12-31T23:59:59Z'),
      );
      const user = User.reconstruct({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('invited@example.com'),
        displayName: null,
        passwordHash: null,
        role: Role.create('GENERAL_USER'),
        status: UserStatus.create('INVITED'),
        invitationToken,
        invitedBy: null,
        invitedAt: null,
        activatedAt: null,
        lastLoginAt: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        version: 0,
      });

      const persistence = mapper.toPersistence(user);

      expect(persistence.display_name).toBeNull();
      expect(persistence.password_hash).toBeNull();
      expect(persistence.invitation_token).toBe(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      );
      expect(persistence.invitation_token_expires_at).toEqual(
        new Date('2025-12-31T23:59:59Z'),
      );
      expect(persistence.invited_by).toBeNull();
      expect(persistence.invited_at).toBeNull();
      expect(persistence.activated_at).toBeNull();
      expect(persistence.last_login_at).toBeNull();
    });
  });

  describe('roundtrip', () => {
    it('should preserve data through toDomain -> toPersistence', () => {
      const entity = new UserEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.email = 'roundtrip@example.com';
      entity.display_name = 'Round Trip';
      entity.password_hash =
        '$2b$12$LJ3m4ys3Lg7MNA18xjSYMuOYKbLBRlTzOkMFpEROVRBXaYsHG7vXa';
      entity.role = 'STAFF';
      entity.status = 'ACTIVE';
      entity.invitation_token = null;
      entity.invitation_token_expires_at = null;
      entity.invited_by = '660e8400-e29b-41d4-a716-446655440000';
      entity.invited_at = new Date('2025-01-01T00:00:00Z');
      entity.activated_at = new Date('2025-01-02T00:00:00Z');
      entity.last_login_at = new Date('2025-01-03T00:00:00Z');
      entity.created_at = new Date('2025-01-01T00:00:00Z');
      entity.updated_at = new Date('2025-01-03T00:00:00Z');
      entity.version = 5;

      const domain = mapper.toDomain(entity);
      const persistence = mapper.toPersistence(domain);

      expect(persistence.id).toBe(entity.id);
      expect(persistence.email).toBe(entity.email);
      expect(persistence.display_name).toBe(entity.display_name);
      expect(persistence.password_hash).toBe(entity.password_hash);
      expect(persistence.role).toBe(entity.role);
      expect(persistence.status).toBe(entity.status);
      expect(persistence.invitation_token).toBe(entity.invitation_token);
      expect(persistence.invited_by).toBe(entity.invited_by);
      expect(persistence.invited_at).toEqual(entity.invited_at);
      expect(persistence.activated_at).toEqual(entity.activated_at);
      expect(persistence.last_login_at).toEqual(entity.last_login_at);
      expect(persistence.version).toBe(entity.version);
    });
  });
});
