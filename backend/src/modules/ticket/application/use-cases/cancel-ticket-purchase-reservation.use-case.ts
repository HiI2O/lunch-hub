import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import type { ITicketPurchaseReservationRepository } from '../../domain/repositories/ticket-purchase-reservation.repository.js';
import type { PurchaseReservationResultDto } from '../dto/index.js';

interface Input {
  readonly purchaseReservationId: string;
  readonly userId: string;
}

export class CancelTicketPurchaseReservationUseCase {
  constructor(private readonly prRepo: ITicketPurchaseReservationRepository) {}

  async execute(input: Input): Promise<PurchaseReservationResultDto> {
    const pr = await this.prRepo.findById(input.purchaseReservationId);
    if (!pr) {
      throw new NotFoundError(
        'TicketPurchaseReservation',
        input.purchaseReservationId,
      );
    }
    if (pr.userId !== input.userId) {
      throw new ValidationError('この操作を実行する権限がありません');
    }

    pr.cancel();
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
