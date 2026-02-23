import { Session } from './session.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('Session', () => {
  const defaultParams = {
    id: 'session-1',
    userId: 'user-1',
    refreshToken: 'refresh-token-value',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  describe('create', () => {
    it('should create a valid session', () => {
      const session = Session.create(defaultParams);

      expect(session.id).toBe('session-1');
      expect(session.userId).toBe('user-1');
      expect(session.refreshToken).toBe('refresh-token-value');
      expect(session.isRevoked).toBe(false);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.lastAccessedAt).toBeInstanceOf(Date);
    });
  });

  describe('revoke', () => {
    it('should revoke a session', () => {
      const session = Session.create(defaultParams);
      session.revoke();
      expect(session.isRevoked).toBe(true);
    });

    it('should throw when revoking already revoked session', () => {
      const session = Session.create(defaultParams);
      session.revoke();
      expect(() => session.revoke()).toThrow(ValidationError);
    });
  });

  describe('updateLastAccessed', () => {
    it('should update last accessed time', () => {
      const session = Session.create(defaultParams);
      const before = session.lastAccessedAt;
      session.updateLastAccessed();
      expect(session.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it('should throw when updating revoked session', () => {
      const session = Session.create(defaultParams);
      session.revoke();
      expect(() => session.updateLastAccessed()).toThrow(ValidationError);
    });
  });

  describe('isValid', () => {
    it('should return true for active non-expired session', () => {
      const session = Session.create(defaultParams);
      expect(session.isValid()).toBe(true);
    });

    it('should return false for revoked session', () => {
      const session = Session.create(defaultParams);
      session.revoke();
      expect(session.isValid()).toBe(false);
    });

    it('should return false for expired session', () => {
      const session = Session.create({
        ...defaultParams,
        expiresAt: new Date(Date.now() - 1000),
      });
      expect(session.isValid()).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should detect expired session', () => {
      const session = Session.create({
        ...defaultParams,
        expiresAt: new Date(Date.now() - 1000),
      });
      expect(session.isExpired()).toBe(true);
    });

    it('should detect non-expired session', () => {
      const session = Session.create(defaultParams);
      expect(session.isExpired()).toBe(false);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct session from persisted data', () => {
      const now = new Date();
      const session = Session.reconstruct({
        id: 'session-1',
        userId: 'user-1',
        refreshToken: 'token',
        isRevoked: true,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(session.isRevoked).toBe(true);
      expect(session.getDomainEvents()).toHaveLength(0);
    });
  });
});
