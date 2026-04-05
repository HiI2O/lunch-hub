import { TypeormGuestRepository } from './typeorm-guest.repository.js';
import type { Repository } from 'typeorm';
import type { GuestEntity } from './entities/guest.entity.js';
import type { GuestMapper } from '../mappers/guest.mapper.js';
import type { Guest } from '../../domain/aggregates/guest.js';

describe('TypeormGuestRepository', () => {
  let repository: TypeormGuestRepository;
  let repo: jest.Mocked<
    Pick<Repository<GuestEntity>, 'save' | 'findOneBy' | 'find'>
  >;
  let mapper: jest.Mocked<Pick<GuestMapper, 'toPersistence' | 'toDomain'>>;
  const mockEntity = { id: 'guest-1' } as GuestEntity;
  const mockGuest = { id: 'guest-1' } as Guest;

  beforeEach(() => {
    repo = {
      save: jest.fn().mockResolvedValue(undefined),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };
    mapper = {
      toPersistence: jest.fn().mockReturnValue(mockEntity),
      toDomain: jest.fn().mockReturnValue(mockGuest),
    };
    repository = new TypeormGuestRepository(
      repo as unknown as Repository<GuestEntity>,
      mapper as unknown as GuestMapper,
    );
  });

  describe('save', () => {
    it('GuestMapper.toPersistenceでエンティティに変換しrepo.saveを呼ぶ', async () => {
      await repository.save(mockGuest);

      expect(mapper.toPersistence).toHaveBeenCalledWith(mockGuest);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('findById', () => {
    it('存在するID → GuestMapper.toDomainでドメインオブジェクトを返す', async () => {
      repo.findOneBy.mockResolvedValue(mockEntity);

      const result = await repository.findById('guest-1');

      expect(result).toBe(mockGuest);
    });

    it('存在しないID → nullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByVisitDate', () => {
    it('指定日に訪問するゲスト一覧を返す', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByVisitDate('2026-04-05');

      expect(repo.find).toHaveBeenCalledWith({
        where: { visit_date: '2026-04-05' },
      });
      expect(result).toHaveLength(1);
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findByVisitDate('2026-04-05');

      expect(result).toEqual([]);
    });
  });
});
