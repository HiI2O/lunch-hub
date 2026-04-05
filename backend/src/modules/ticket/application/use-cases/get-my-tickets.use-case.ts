import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import type { TicketResultDto } from '../dto/index.js';

interface Input {
  readonly userId: string;
}

export class GetMyTicketsUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(input: Input): Promise<TicketResultDto[]> {
    const tickets = await this.ticketRepo.findByOwnerId(input.userId);
    return tickets.map((t) => ({
      id: t.id,
      ownerId: t.ownerId,
      remainingCount: t.remainingCount,
      status: t.status.value,
      purchaseDate: t.purchaseDate,
    }));
  }
}
