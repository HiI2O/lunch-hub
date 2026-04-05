import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { ReservationDeadlineService } from '../../domain/services/reservation-deadline.service.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { ReservationResultDto } from '../dto/reservation-result.dto.js';

interface CancelReservationDto {
  readonly reservationId: string;
  readonly userId: string;
}

export class CancelReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly nowFn: () => Date = () => new Date(),
  ) {}

  async execute(dto: CancelReservationDto): Promise<ReservationResultDto> {
    const reservation = await this.reservationRepository.findById(
      dto.reservationId,
    );
    if (reservation === null) {
      throw new NotFoundError('Reservation', dto.reservationId);
    }

    if (reservation.userId !== dto.userId) {
      throw new ValidationError('この予約をキャンセルする権限がありません');
    }

    const now = this.nowFn();
    if (
      !ReservationDeadlineService.isBeforeDeadline(
        reservation.reservationDate,
        now,
      )
    ) {
      throw new ValidationError('予約の締め切り時刻を過ぎています');
    }

    reservation.cancel();
    await this.reservationRepository.save(reservation);

    return {
      id: reservation.id,
      reservationDate: reservation.reservationDate,
      paymentMethod: reservation.paymentMethod.value,
      status: reservation.status.value,
      ticketId: reservation.ticketId,
      createdAt: reservation.createdAt,
    };
  }
}
