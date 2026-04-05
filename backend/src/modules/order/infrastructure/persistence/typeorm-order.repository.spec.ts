import { TypeormOrderRepository } from './typeorm-order.repository.js';
import type { Repository } from 'typeorm';
import type { OrderEntity } from './entities/order.entity.js';
import type { OrderMapper } from '../mappers/order.mapper.js';
import type { Order } from '../../domain/aggregates/order.js';

describe('TypeormOrderRepository', () => {
  let repository: TypeormOrderRepository;
  let repo: jest.Mocked<
    Pick<Repository<OrderEntity>, 'save' | 'findOne' | 'find'>
  >;
  let mapper: jest.Mocked<Pick<OrderMapper, 'toPersistence' | 'toDomain'>>;
  const mockEntity = { id: 'order-1' } as OrderEntity;
  const mockOrder = { id: 'order-1' } as Order;

  beforeEach(() => {
    repo = {
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    mapper = {
      toPersistence: jest.fn().mockReturnValue(mockEntity),
      toDomain: jest.fn().mockReturnValue(mockOrder),
    };
    repository = new TypeormOrderRepository(
      repo as unknown as Repository<OrderEntity>,
      mapper as unknown as OrderMapper,
    );
  });

  describe('save', () => {
    it('OrderMapper.toPersistenceでエンティティに変換しrepo.saveを呼ぶ', async () => {
      await repository.save(mockOrder);

      expect(mapper.toPersistence).toHaveBeenCalledWith(mockOrder);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('findById', () => {
    it('存在するID → OrderMapper.toDomainでドメインオブジェクトを返す', async () => {
      repo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findById('order-1');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1' },
      });
      expect(result).toBe(mockOrder);
    });

    it('存在しないID → nullを返す', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByDate', () => {
    it('存在する日付 → ドメインオブジェクトを返す', async () => {
      repo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findByDate('2026-04-05');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { order_date: '2026-04-05' },
      });
      expect(result).toBe(mockOrder);
    });

    it('存在しない日付 → nullを返す', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await repository.findByDate('2026-04-05');

      expect(result).toBeNull();
    });
  });

  describe('findByDateRange', () => {
    it('期間内の注文一覧を返す', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByDateRange(
        '2026-04-01',
        '2026-04-30',
      );

      expect(result).toHaveLength(1);
    });

    it('結果はorder_date ASCでソートされる', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByDateRange('2026-04-01', '2026-04-30');

      const callArgs = repo.find.mock.calls[0][0] as {
        order: Record<string, string>;
      };
      expect(callArgs.order).toEqual({ order_date: 'ASC' });
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findByDateRange(
        '2026-04-01',
        '2026-04-30',
      );

      expect(result).toEqual([]);
    });
  });
});
