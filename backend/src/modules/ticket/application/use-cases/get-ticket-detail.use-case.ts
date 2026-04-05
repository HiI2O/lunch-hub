import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import type { TicketResultDto } from '../dto/index.js';

interface Input {
  readonly ticketId: string;
  readonly userId: string;
}

export class GetTicketDetailUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(input: Input): Promise<TicketResultDto> {
    const ticket = await this.ticketRepo.findById(input.ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', input.ticketId);
    }
    if (ticket.ownerId !== input.userId) {
      throw new ValidationError('この操作を実行する権限���ありません');
    }
    return {
      id: ticket.id,
      ownerId: ticket.ownerId,
      remainingCount: ticket.remainingCount,
      status: ticket.status.value,
      purchaseDate: ticket.purchaseDate,
    };
  }
}
