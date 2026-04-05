import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { ReservationDetailDto } from '../dto/reservation-detail.dto.js';

interface GetReservationDetailInput {
  readonly reservationId: string;
  readonly userId: string;
}

export class GetReservationDetailUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(dto: GetReservationDetailInput): Promise<ReservationDetailDto> {
    const reservation = await this.reservationRepository.findById(
      dto.reservationId,
    );
    if (reservation === null) {
      throw new NotFoundError('Reservation', dto.reservationId);
    }

    if (reservation.userId !== dto.userId) {
      throw new ValidationError('この予約を参照する権限がありません');
    }

    return {
      id: reservation.id,
      reservationDate: reservation.reservationDate,
      paymentMethod: reservation.paymentMethod.value,
      status: reservation.status.value,
      ticketId: reservation.ticketId,
      orderId: reservation.orderId,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }
}
