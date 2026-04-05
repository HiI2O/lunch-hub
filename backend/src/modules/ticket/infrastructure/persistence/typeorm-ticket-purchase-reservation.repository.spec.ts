import { TypeormTicketPurchaseReservationRepository } from './typeorm-ticket-purchase-reservation.repository.js';
import type { Repository } from 'typeorm';
import type { TicketPurchaseReservationEntity } from './entities/ticket-purchase-reservation.entity.js';
import type { TicketPurchaseReservationMapper } from '../mappers/ticket-purchase-reservation.mapper.js';
import type { TicketPurchaseReservation } from '../../domain/aggregates/ticket-purchase-reservation.js';

describe('TypeormTicketPurchaseReservationRepository', () => {
  let repository: TypeormTicketPurchaseReservationRepository;
  let repo: jest.Mocked<
    Pick<Repository<TicketPurchaseReservationEntity>, 'save' | 'findOne' | 'find'>
  >;
  let mapper: jest.Mocked<
    Pick<TicketPurchaseReservationMapper, 'toPersistence' | 'toDomain'>
  >;
  const mockEntity = { id: 'pr-1' } as TicketPurchaseReservationEntity;
  const mockPR = { id: 'pr-1' } as TicketPurchaseReservation;

  beforeEach(() => {
    repo = {
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    mapper = {
      toPersistence: jest.fn().mockReturnValue(mockEntity),
      toDomain: jest.fn().mockReturnValue(mockPR),
    };
    repository = new TypeormTicketPurchaseReservationRepository(
      repo as unknown as Repository<TicketPurchaseReservationEntity>,
      mapper as unknown as TicketPurchaseReservationMapper,
    );
  });

  describe('save', () => {
    it('TicketPurchaseReservationMapper.toPersistenceでエンティティに変換しrepo.saveを呼ぶ', async () => {
      await repository.save(mockPR);

      expect(mapper.toPersistence).toHaveBeenCalledWith(mockPR);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('findById', () => {
    it('存在するID → ドメインオブジェクトを返す', async () => {
      repo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findById('pr-1');

      expect(result).toBe(mockPR);
    });

    it('存在しないID → nullを返す', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('ユーザーIDに紐づく購入予約一覧を返す', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByUserId('user-1');

      expect(result).toHaveLength(1);
    });

    it('結果はcreated_at DESCでソートされる', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByUserId('user-1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        order: { created_at: 'DESC' },
      });
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('findByPurchaseDate', () => {
    it('購入日に紐づく購入予約一覧を返す', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByPurchaseDate('2026-04-05');

      expect(result).toHaveLength(1);
    });

    it('結果はcreated_at DESCでソートされる', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByPurchaseDate('2026-04-05');

      expect(repo.find).toHaveBeenCalledWith({
        where: { purchase_date: '2026-04-05' },
        order: { created_at: 'DESC' },
      });
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findByPurchaseDate('2026-04-05');

      expect(result).toEqual([]);
    });
  });
});
