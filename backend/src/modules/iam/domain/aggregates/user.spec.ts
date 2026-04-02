import { User } from './user.js';
import { EmailAddress } from '../value-objects/email-address.js';
import { DisplayName } from '../value-objects/display-name.js';
import { PasswordHash } from '../value-objects/password-hash.js';
import { Role } from '../value-objects/role.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

describe('User', () => {
  describe('invite', () => {
    it('should create an invited user with domain event', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });

      expect(user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.email.value).toBe('test@example.com');
      expect(user.status.isInvited()).toBe(true);
      expect(user.invitationToken).not.toBeNull();
      expect(user.invitedBy).toBe('admin-id');
      expect(user.displayName).toBeNull();
      expect(user.passwordHash).toBeNull();

      const events = user.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.eventName).toBe('UserInvited');
    });
  });

  describe('selfSignUp', () => {
    it('should create a self-signup user with GENERAL_USER role', () => {
      const user = User.selfSignUp({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('user@example.com'),
      });

      expect(user.role.isGeneralUser()).toBe(true);
      expect(user.status.isInvited()).toBe(true);
      expect(user.invitationToken).not.toBeNull();
      expect(user.invitedBy).toBeNull();
    });
  });

  describe('activate', () => {
    it('should activate an invited user', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });
      user.clearDomainEvents();

      user.activate(
        PasswordHash.create(VALID_HASH),
        DisplayName.create('テストユーザー'),
      );

      expect(user.status.isActive()).toBe(true);
      expect(user.passwordHash?.value).toBe(VALID_HASH);
      expect(user.displayName?.value).toBe('テストユーザー');
      expect(user.invitationToken).toBeNull();
      expect(user.activatedAt).not.toBeNull();

      const events = user.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.eventName).toBe('UserActivated');
    });

    it('should throw when activating non-invited user', () => {
      const user = createActiveUser();
      expect(() =>
        user.activate(
          PasswordHash.create(VALID_HASH),
          DisplayName.create('name'),
        ),
      ).toThrow(ValidationError);
    });
  });

  describe('changePassword', () => {
    it('should change password for active user', () => {
      const user = createActiveUser();
      user.clearDomainEvents();
      const newHash = VALID_HASH;
      user.changePassword(PasswordHash.create(newHash));

      expect(user.passwordHash?.value).toBe(newHash);
      expect(user.getDomainEvents()).toHaveLength(1);
      expect(user.getDomainEvents()[0]?.eventName).toBe('PasswordChanged');
    });

    it('should throw when changing password for non-active user', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });
      expect(() =>
        user.changePassword(PasswordHash.create(VALID_HASH)),
      ).toThrow(ValidationError);
    });
  });

  describe('changeRole', () => {
    it('should change role for active user', () => {
      const user = createActiveUser();
      user.changeRole(Role.create('ADMINISTRATOR'));
      expect(user.role.isAdministrator()).toBe(true);
    });

    it('should throw when changing role for non-active user', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });
      expect(() => user.changeRole(Role.create('STAFF'))).toThrow(
        ValidationError,
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate active user', () => {
      const user = createActiveUser();
      user.clearDomainEvents();
      user.deactivate();

      expect(user.status.isDeactivated()).toBe(true);
      expect(user.getDomainEvents()).toHaveLength(1);
      expect(user.getDomainEvents()[0]?.eventName).toBe('UserDeactivated');
    });

    it('should throw when deactivating non-active user', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });
      expect(() => user.deactivate()).toThrow(ValidationError);
    });
  });

  describe('reactivate', () => {
    it('should reactivate deactivated user', () => {
      const user = createActiveUser();
      user.deactivate();
      user.clearDomainEvents();
      user.reactivate();

      expect(user.status.isActive()).toBe(true);
      expect(user.getDomainEvents()).toHaveLength(1);
      expect(user.getDomainEvents()[0]?.eventName).toBe('UserReactivated');
    });

    it('should throw when reactivating non-deactivated user', () => {
      const user = createActiveUser();
      expect(() => user.reactivate()).toThrow(ValidationError);
    });
  });

  describe('canLogin', () => {
    it('should return true for active user with password', () => {
      const user = createActiveUser();
      expect(user.canLogin()).toBe(true);
    });

    it('should return false for invited user', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });
      expect(user.canLogin()).toBe(false);
    });
  });

  describe('refreshInvitationToken', () => {
    it('should generate new token for invited user', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });
      const oldToken = user.invitationToken?.token;
      user.clearDomainEvents();

      user.refreshInvitationToken();

      expect(user.invitationToken?.token).not.toBe(oldToken);
      expect(user.getDomainEvents()).toHaveLength(1);
    });

    it('should throw for non-invited user', () => {
      const user = createActiveUser();
      expect(() => user.refreshInvitationToken()).toThrow(ValidationError);
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel invitation for invited user', () => {
      const user = User.invite({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        role: Role.create('GENERAL_USER'),
        invitedBy: 'admin-id',
      });
      user.cancelInvitation();

      expect(user.status.isDeactivated()).toBe(true);
      expect(user.invitationToken).toBeNull();
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct user from persisted data', () => {
      const now = new Date();
      const user = User.reconstruct({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: EmailAddress.create('test@example.com'),
        displayName: DisplayName.create('テスト'),
        passwordHash: PasswordHash.create(VALID_HASH),
        role: Role.create('STAFF'),
        status: UserStatus.create('ACTIVE'),
        invitationToken: null,
        invitedBy: null,
        invitedAt: now,
        activatedAt: now,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      });

      expect(user.getDomainEvents()).toHaveLength(0);
      expect(user.email.value).toBe('test@example.com');
      expect(user.version).toBe(1);
    });
  });
});

function createActiveUser(): User {
  const user = User.invite({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: EmailAddress.create('test@example.com'),
    role: Role.create('GENERAL_USER'),
    invitedBy: 'admin-id',
  });
  user.activate(
    PasswordHash.create(VALID_HASH),
    DisplayName.create('テストユーザー'),
  );
  return user;
}

// Need to import UserStatus for reconstruct test
import { UserStatus } from '../value-objects/user-status.js';
