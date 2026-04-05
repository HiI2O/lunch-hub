import { GetTicketDetailUseCase } from './get-ticket-detail.use-case.js';
import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import { Ticket } from '../../domain/aggregates/ticket.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createMockRepo(): jest.Mocked<ITicketRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByOwnerId: jest.fn().mockResolvedValue([]),
  };
}

describe('GetTicketDetailUseCase', () => {
  let useCase: GetTicketDetailUseCase;
  let repo: jest.Mocked<ITicketRepository>;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new GetTicketDetailUseCase(repo);
  });

  it('チケット詳細を取得する', async () => {
    const ticket = Ticket.create({
      id: 't1',
      ownerId: 'user-1',
      initialCount: 10,
      purchaseDate: '2026-04-10',
    });
    repo.findById.mockResolvedValue(ticket);

    const result = await useCase.execute({
      ticketId: 't1',
      userId: 'user-1',
    });

    expect(result.id).toBe('t1');
    expect(result.remainingCount).toBe(10);
  });

  it('存在しないチケットはNotFoundError', async () => {
    await expect(
      useCase.execute({ ticketId: 'not-found', userId: 'user-1' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('他ユーザーのチケットは取得できない', async () => {
    const ticket = Ticket.create({
      id: 't1',
      ownerId: 'user-1',
      initialCount: 10,
      purchaseDate: '2026-04-10',
    });
    repo.findById.mockResolvedValue(ticket);

    await expect(
      useCase.execute({ ticketId: 't1', userId: 'other-user' }),
    ).rejects.toThrow('権限');
  });
});
