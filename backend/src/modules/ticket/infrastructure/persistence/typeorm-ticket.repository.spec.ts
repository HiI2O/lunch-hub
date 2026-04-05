import { TypeormTicketRepository } from './typeorm-ticket.repository.js';
import type { Repository } from 'typeorm';
import type { TicketEntity } from './entities/ticket.entity.js';
import type { TicketMapper } from '../mappers/ticket.mapper.js';
import type { Ticket } from '../../domain/aggregates/ticket.js';

describe('TypeormTicketRepository', () => {
  let repository: TypeormTicketRepository;
  let repo: jest.Mocked<
    Pick<Repository<TicketEntity>, 'save' | 'findOne' | 'find'>
  >;
  let mapper: jest.Mocked<Pick<TicketMapper, 'toPersistence' | 'toDomain'>>;
  const mockEntity = { id: 'ticket-1' } as TicketEntity;
  const mockTicket = { id: 'ticket-1' } as Ticket;

  beforeEach(() => {
    repo = {
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    mapper = {
      toPersistence: jest.fn().mockReturnValue(mockEntity),
      toDomain: jest.fn().mockReturnValue(mockTicket),
    };
    repository = new TypeormTicketRepository(
      repo as unknown as Repository<TicketEntity>,
      mapper as unknown as TicketMapper,
    );
  });

  describe('save', () => {
    it('TicketMapper.toPersistenceでエンティティに変換しrepo.saveを呼ぶ', async () => {
      await repository.save(mockTicket);

      expect(mapper.toPersistence).toHaveBeenCalledWith(mockTicket);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('findById', () => {
    it('存在するID → TicketMapper.toDomainでドメインオブジェクトを返す', async () => {
      repo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findById('ticket-1');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
      });
      expect(result).toBe(mockTicket);
    });

    it('存在しないID → nullを返す', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByOwnerId', () => {
    it('所有者IDに紐づくチケット一覧を返す', async () => {
      repo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByOwnerId('user-1');

      expect(result).toHaveLength(1);
    });

    it('結果はcreated_at DESCでソートされる', async () => {
      repo.find.mockResolvedValue([]);

      await repository.findByOwnerId('user-1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { owner_id: 'user-1' },
        order: { created_at: 'DESC' },
      });
    });

    it('該当なし → 空配列を返す', async () => {
      repo.find.mockResolvedValue([]);

      const result = await repository.findByOwnerId('user-1');

      expect(result).toEqual([]);
    });
  });
});
