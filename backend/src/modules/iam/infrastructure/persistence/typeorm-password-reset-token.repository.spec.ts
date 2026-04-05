import { TypeormPasswordResetTokenRepository } from './typeorm-password-reset-token.repository.js';
import type { Repository } from 'typeorm';
import type { PasswordResetTokenEntity } from './entities/password-reset-token.entity.js';
import type { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper.js';
import type { PasswordResetTokenRecord } from '../../domain/repositories/password-reset-token.repository.js';

describe('TypeormPasswordResetTokenRepository', () => {
  let repository: TypeormPasswordResetTokenRepository;
  let repo: jest.Mocked<
    Pick<Repository<PasswordResetTokenEntity>, 'save' | 'findOneBy' | 'delete'>
  >;
  let mapper: jest.Mocked<
    Pick<PasswordResetTokenMapper, 'toPersistence' | 'toDomain'>
  >;
  const mockEntity = { token: 'tok' } as PasswordResetTokenEntity;
  const mockRecord = { token: 'tok' } as unknown as PasswordResetTokenRecord;

  beforeEach(() => {
    repo = {
      save: jest.fn().mockResolvedValue(undefined),
      findOneBy: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    mapper = {
      toPersistence: jest.fn().mockReturnValue(mockEntity),
      toDomain: jest.fn().mockReturnValue(mockRecord),
    };
    repository = new TypeormPasswordResetTokenRepository(
      repo as unknown as Repository<PasswordResetTokenEntity>,
      mapper as unknown as PasswordResetTokenMapper,
    );
  });

  describe('save', () => {
    it('PasswordResetTokenMapper.toPersistenceで変換しrepo.saveを呼ぶ', async () => {
      await repository.save(mockRecord);

      expect(mapper.toPersistence).toHaveBeenCalledWith(mockRecord);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('findByToken', () => {
    it('存在するトークン → PasswordResetTokenMapper.toDomainでレコードを返す', async () => {
      repo.findOneBy.mockResolvedValue(mockEntity);

      const result = await repository.findByToken('tok');

      expect(repo.findOneBy).toHaveBeenCalledWith({ token: 'tok' });
      expect(mapper.toDomain).toHaveBeenCalledWith(mockEntity);
      expect(result).toBe(mockRecord);
    });

    it('存在しないトークン → nullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await repository.findByToken('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('deleteByUserId', () => {
    it('repo.deleteでユーザーIDに紐づくレコードを削除する', async () => {
      await repository.deleteByUserId('user-1');

      expect(repo.delete).toHaveBeenCalledWith({ user_id: 'user-1' });
    });
  });
});
