/* eslint-disable @typescript-eslint/unbound-method */
import { GetMyTicketsUseCase } from './get-my-tickets.use-case.js';
import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import { Ticket } from '../../domain/aggregates/ticket.js';

function createMockRepo(): jest.Mocked<ITicketRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByOwnerId: jest.fn().mockResolvedValue([]),
  };
}

describe('GetMyTicketsUseCase', () => {
  let useCase: GetMyTicketsUseCase;
  let repo: jest.Mocked<ITicketRepository>;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new GetMyTicketsUseCase(repo);
  });

  it('ユーザーのチケット一覧を取得する', async () => {
    const ticket = Ticket.create({
      id: 't1',
      ownerId: 'user-1',
      initialCount: 10,
      purchaseDate: '2026-04-10',
    });
    repo.findByOwnerId.mockResolvedValue([ticket]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(repo.findByOwnerId).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t1');
    expect(result[0].remainingCount).toBe(10);
    expect(result[0].status).toBe('PENDING');
  });
});
