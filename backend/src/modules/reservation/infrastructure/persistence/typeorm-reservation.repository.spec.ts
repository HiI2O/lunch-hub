import { TypeormReservationRepository } from './typeorm-reservation.repository.js';
import type { Repository } from 'typeorm';
import type { ReservationEntity } from './entities/reservation.entity.js';
import type { ReservationMapper } from '../mappers/reservation.mapper.js';
import type { Reservation } from '../../domain/aggregates/reservation.js';

describe('TypeormReservationRepository', () => {
  let repository: TypeormReservationRepository;
  let repo: jest.Mocked<
    Pick<Repository<ReservationEntity>, 'save' | 'findOneBy' | 'find'>
  >;
  let mapper: jest.Mocked<
    Pick<ReservationMapper, 'toPersistence' | 'toDomain'>
  >;
  const mockEntity = { id: 'res-1' } as ReservationEntity;
  const mockReservation = { id: 'res-1' } as Reservation;

  beforeEach(() => {
    repo = {
      save: jest.fn().mockResolvedValue(undefined),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };
    mapper = {
      toPersistence: jest.fn().mockReturnValue(mockEntity),
      toDomain: jest.fn().mockReturnValue(mockReservation),
    };
    repository = new TypeormReservationRepository(
      repo as unknown as Repository<ReservationEntity>,
      mapper as unknown as ReservationMapper,
    );
  });

  describe('save', () => {
    it('ReservationMapper.toPersistenceでエンティティに変換しrepo.saveを呼ぶ', async () => {
      await repository.save(mockReservation);

      expect(mapper.toPersistence).toHaveBeenCalledWith(mockReservation);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('findById', () => {
    it('存在するID → ReservationMapper.toDomainでドメインオブジェクトを返す', async () => {
      repo.findOneBy.mockResolvedValue(mockEntity);

      const result = await repository.findById('res-1');

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'res-1' });
      expect(result).toBe(mockReservation);
    });

    it('存在しないID → nullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('ユーザーIDのみ指定 → 該当ユーザーの全予約を返す', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByUserId('user-1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        order: { reservation_date: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });

    it('from + to指定 → Between(from, to)で期間フィルタが適用される', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByUserId('user-1', '2026-04-01', '2026-04-30');

      const callArgs = repo.find.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(callArgs.where.reservation_date).toBeDefined();
    });

    it('status指定 → ステータスフィルタが適用される', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByUserId(
        'user-1',
        undefined,
        undefined,
        'CONFIRMED',
      );

      const callArgs = repo.find.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(callArgs.where.status).toBe('CONFIRMED');
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual([]);
    });

    it('結果はreservation_date ASCでソートされる', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByUserId('user-1');

      const callArgs = repo.find.mock.calls[0][0] as {
        order: Record<string, string>;
      };
      expect(callArgs.order).toEqual({ reservation_date: 'ASC' });
    });
  });

  describe('findByDate', () => {
    it('指定日の予約一覧を返す（CANCELLED除外）', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByDate('2026-04-05');

      expect(result).toHaveLength(1);
      const callArgs = repo.find.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(callArgs.where.reservation_date).toBe('2026-04-05');
      expect(callArgs.where.status).toBeDefined();
    });

    it('結果はcreated_at ASCでソートされる', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByDate('2026-04-05');

      const callArgs = repo.find.mock.calls[0][0] as {
        order: Record<string, string>;
      };
      expect(callArgs.order).toEqual({ created_at: 'ASC' });
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findByDate('2026-04-05');

      expect(result).toEqual([]);
    });
  });

  describe('findByUserIdAndDate', () => {
    it('ユーザーID + 日付で一致する予約を返す（CANCELLED除外）', async () => {
      repo.findOneBy.mockResolvedValue(mockEntity);

      const result = await repository.findByUserIdAndDate(
        'user-1',
        '2026-04-05',
      );

      expect(result).toBe(mockReservation);
      expect(repo.findOneBy).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          reservation_date: '2026-04-05',
        }),
      );
    });

    it('該当なし → nullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await repository.findByUserIdAndDate(
        'user-1',
        '2026-04-05',
      );

      expect(result).toBeNull();
    });
  });

  describe('findCalendarData', () => {
    it('user_idフィルタが適用される', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findCalendarData('user-1', 2026, 4);

      const callArgs = repo.find.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(callArgs.where.user_id).toBe('user-1');
    });

    it('CANCELLED除外条件が適用される', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findCalendarData('user-1', 2026, 4);

      const callArgs = repo.find.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(callArgs.where.status).toBeDefined();
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findCalendarData('user-1', 2026, 4);

      expect(result).toEqual([]);
    });
  });
});
