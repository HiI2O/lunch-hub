import { Injectable } from '@nestjs/common';
import { ReservationEntity } from '../persistence/entities/reservation.entity.js';
import { Reservation } from '../../domain/aggregates/reservation.js';

@Injectable()
export class ReservationMapper {
  toDomain(entity: ReservationEntity): Reservation {
    return Reservation.reconstruct({
      id: entity.id,
      userId: entity.user_id,
      reservationDate: entity.reservation_date,
      paymentMethod: entity.payment_method,
      status: entity.status,
      ticketId: entity.ticket_id,
      orderId: entity.order_id,
      guestId: entity.guest_id,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      version: entity.version,
    });
  }

  toPersistence(reservation: Reservation): Partial<ReservationEntity> {
    return {
      id: reservation.id,
      user_id: reservation.userId,
      guest_id: reservation.guestId,
      reservation_date: reservation.reservationDate,
      payment_method: reservation.paymentMethod.value,
      status: reservation.status.value,
      ticket_id: reservation.ticketId,
      order_id: reservation.orderId,
      created_at: reservation.createdAt,
      updated_at: reservation.updatedAt,
      version: reservation.version,
    };
  }
}
