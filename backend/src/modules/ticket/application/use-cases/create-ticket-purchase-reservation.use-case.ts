import { randomUUID } from 'node:crypto';
import type { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import type { ITicketPurchaseReservationRepository } from '../../domain/repositories/ticket-purchase-reservation.repository.js';
import { Ticket } from '../../domain/aggregates/ticket.js';
import { TicketPurchaseReservation } from '../../domain/aggregates/ticket-purchase-reservation.js';
import type { PurchaseReservationResultDto } from '../dto/index.js';

interface Input {
  readonly userId: string;
  readonly purchaseDate: string;
  readonly quantity: number;
}

export class CreateTicketPurchaseReservationUseCase {
  constructor(
    private readonly ticketRepo: ITicketRepository,
    private readonly prRepo: ITicketPurchaseReservationRepository,
  ) {}

  async execute(input: Input): Promise<PurchaseReservationResultDto> {
    const prId = randomUUID();
    const ticketId = randomUUID();

    // 購入予約を作成
    const pr = TicketPurchaseReservation.create({
      id: prId,
      userId: input.userId,
      purchaseDate: input.purchaseDate,
      quantity: input.quantity,
    });

    // チケットを同時作成（PENDING状態、即座に使用可能）
    const ticket = Ticket.create({
      id: ticketId,
      ownerId: input.userId,
      initialCount: pr.getTotalTickets(),
      purchaseDate: input.purchaseDate,
    });

    pr.setTicketId(ticketId);

    await this.ticketRepo.save(ticket);
    await this.prRepo.save(pr);

    return {
      id: pr.id,
      userId: pr.userId,
      purchaseDate: pr.purchaseDate,
      quantity: pr.quantity.getSets(),
      totalTickets: pr.getTotalTickets(),
      status: pr.status.value,
      ticketId: pr.ticketId,
    };
  }
}
