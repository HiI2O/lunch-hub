import { PasswordResetTokenMapper } from './password-reset-token.mapper.js';
import { PasswordResetTokenEntity } from '../persistence/entities/password-reset-token.entity.js';
import { PasswordResetToken } from '../../domain/value-objects/password-reset-token.js';
import type { PasswordResetTokenRecord } from '../../domain/repositories/password-reset-token.repository.js';

describe('PasswordResetTokenMapper', () => {
  let mapper: PasswordResetTokenMapper;

  beforeEach(() => {
    mapper = new PasswordResetTokenMapper();
  });

  describe('toDomain', () => {
    it('should convert PasswordResetTokenEntity to PasswordResetTokenRecord', () => {
      const entity = new PasswordResetTokenEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.user_id = '660e8400-e29b-41d4-a716-446655440000';
      entity.token = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      entity.expires_at = new Date('2025-12-31T23:59:59Z');
      entity.created_at = new Date('2025-01-01T00:00:00Z');

      const record = mapper.toDomain(entity);

      expect(record.id).toBe(entity.id);
      expect(record.userId).toBe(entity.user_id);
      expect(record.token.token).toBe(entity.token);
      expect(record.token.expiresAt).toEqual(entity.expires_at);
    });
  });

  describe('toPersistence', () => {
    it('should convert PasswordResetTokenRecord to persistence object', () => {
      const token = PasswordResetToken.create(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        new Date('2025-12-31T23:59:59Z'),
      );
      const record: PasswordResetTokenRecord = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '660e8400-e29b-41d4-a716-446655440000',
        token,
      };

      const persistence = mapper.toPersistence(record);

      expect(persistence.id).toBe(record.id);
      expect(persistence.user_id).toBe(record.userId);
      expect(persistence.token).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(persistence.expires_at).toEqual(new Date('2025-12-31T23:59:59Z'));
    });
  });

  describe('roundtrip', () => {
    it('should preserve data through toDomain -> toPersistence', () => {
      const entity = new PasswordResetTokenEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.user_id = '660e8400-e29b-41d4-a716-446655440000';
      entity.token = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      entity.expires_at = new Date('2025-12-31T23:59:59Z');
      entity.created_at = new Date('2025-01-01T00:00:00Z');

      const record = mapper.toDomain(entity);
      const persistence = mapper.toPersistence(record);

      expect(persistence.id).toBe(entity.id);
      expect(persistence.user_id).toBe(entity.user_id);
      expect(persistence.token).toBe(entity.token);
      expect(persistence.expires_at).toEqual(entity.expires_at);
    });
  });
});
