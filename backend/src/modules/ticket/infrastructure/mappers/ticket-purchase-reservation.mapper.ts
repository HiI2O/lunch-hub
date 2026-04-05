import { Injectable } from '@nestjs/common';
import { TicketPurchaseReservation } from '../../domain/aggregates/ticket-purchase-reservation.js';
import type { TicketPurchaseReservationEntity } from '../persistence/entities/ticket-purchase-reservation.entity.js';

@Injectable()
export class TicketPurchaseReservationMapper {
  toDomain(entity: TicketPurchaseReservationEntity): TicketPurchaseReservation {
    return TicketPurchaseReservation.reconstruct({
      id: entity.id,
      userId: entity.user_id,
      purchaseDate: entity.purchase_date,
      quantity: entity.quantity,
      status: entity.status,
      ticketId: entity.ticket_id,
      createdAt: entity.created_at,
      version: entity.version,
    });
  }

  toPersistence(
    domain: TicketPurchaseReservation,
  ): Partial<TicketPurchaseReservationEntity> {
    return {
      id: domain.id,
      user_id: domain.userId,
      purchase_date: domain.purchaseDate,
      quantity: domain.quantity.getSets(),
      status: domain.status.value,
      ticket_id: domain.ticketId,
    };
  }
}
