import { TypeormUserRepository } from './typeorm-user.repository.js';
import type { Repository } from 'typeorm';
import type { UserEntity } from './entities/user.entity.js';
import type { UserMapper } from '../mappers/user.mapper.js';
import type { User } from '../../domain/aggregates/user.js';

describe('TypeormUserRepository', () => {
  let repository: TypeormUserRepository;
  let repo: jest.Mocked<
    Pick<Repository<UserEntity>, 'save' | 'findOneBy' | 'find' | 'existsBy'>
  >;
  let mapper: jest.Mocked<Pick<UserMapper, 'toPersistence' | 'toDomain'>>;
  const mockEntity = { id: 'user-1' } as UserEntity;
  const mockUser = { id: 'user-1' } as User;

  beforeEach(() => {
    repo = {
      save: jest.fn().mockResolvedValue(undefined),
      findOneBy: jest.fn(),
      find: jest.fn(),
      existsBy: jest.fn(),
    };
    mapper = {
      toPersistence: jest.fn().mockReturnValue(mockEntity),
      toDomain: jest.fn().mockReturnValue(mockUser),
    };
    repository = new TypeormUserRepository(
      repo as unknown as Repository<UserEntity>,
      mapper as unknown as UserMapper,
    );
  });

  describe('save', () => {
    it('UserMapper.toPersistenceでエンティティに変換しrepo.saveを呼ぶ', async () => {
      await repository.save(mockUser);

      expect(mapper.toPersistence).toHaveBeenCalledWith(mockUser);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('findById', () => {
    it('存在するID → UserMapper.toDomainでドメインオブジェクトを返す', async () => {
      repo.findOneBy.mockResolvedValue(mockEntity);

      const result = await repository.findById('user-1');

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mapper.toDomain).toHaveBeenCalledWith(mockEntity);
      expect(result).toBe(mockUser);
    });

    it('存在しないID → nullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('存在するメール → ドメインオブジェクトを返す', async () => {
      repo.findOneBy.mockResolvedValue(mockEntity);

      const result = await repository.findByEmail('test@example.com');

      expect(repo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toBe(mockUser);
    });

    it('存在しないメール → nullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByInvitationToken', () => {
    it('存在するトークン → ドメインオブジェクトを返す', async () => {
      repo.findOneBy.mockResolvedValue(mockEntity);

      const result = await repository.findByInvitationToken('token-abc');

      expect(repo.findOneBy).toHaveBeenCalledWith({
        invitation_token: 'token-abc',
      });
      expect(result).toBe(mockUser);
    });

    it('存在しないトークン → nullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await repository.findByInvitationToken('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('existsByEmail', () => {
    it('存在するメール → trueを返す', async () => {
      repo.existsBy.mockResolvedValue(true);

      const result = await repository.existsByEmail('test@example.com');

      expect(result).toBe(true);
    });

    it('存在しないメール → falseを返す', async () => {
      repo.existsBy.mockResolvedValue(false);

      const result = await repository.existsByEmail('unknown@example.com');

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('全ユーザーをドメインオブジェクトの配列で返す', async () => {
      const entities = [mockEntity, { id: 'user-2' } as UserEntity];
      repo.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(mapper.toDomain).toHaveBeenCalledTimes(2);
    });

    it('ユーザー0件 → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });
});
