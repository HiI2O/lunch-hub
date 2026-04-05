import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import type { ITicketPurchaseReservationRepository } from '../../domain/repositories/ticket-purchase-reservation.repository.js';

interface Input {
  readonly purchaseReservationId: string;
}

interface Result {
  readonly ticketStatus: string;
  readonly purchaseStatus: string;
}

export class ReceiveTicketUseCase {
  constructor(
    private readonly ticketRepo: ITicketRepository,
    private readonly prRepo: ITicketPurchaseReservationRepository,
  ) {}

  async execute(input: Input): Promise<Result> {
    const pr = await this.prRepo.findById(input.purchaseReservationId);
    if (!pr) {
      throw new NotFoundError(
        'TicketPurchaseReservation',
        input.purchaseReservationId,
      );
    }

    const ticket = pr.ticketId
      ? await this.ticketRepo.findById(pr.ticketId)
      : null;
    if (!ticket) {
      throw new NotFoundError('Ticket', pr.ticketId ?? 'unknown');
    }

    ticket.receive();
    pr.receive();

    await this.ticketRepo.save(ticket);
    await this.prRepo.save(pr);

    return {
      ticketStatus: ticket.status.value,
      purchaseStatus: pr.status.value,
    };
  }
}
