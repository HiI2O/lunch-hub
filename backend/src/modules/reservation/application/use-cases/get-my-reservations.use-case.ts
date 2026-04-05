import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import type { ReservationResultDto } from '../dto/reservation-result.dto.js';

interface GetMyReservationsDto {
  readonly userId: string;
  readonly from?: string;
  readonly to?: string;
  readonly status?: string;
}

export class GetMyReservationsUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(dto: GetMyReservationsDto): Promise<ReservationResultDto[]> {
    const reservations = await this.reservationRepository.findByUserId(
      dto.userId,
      dto.from,
      dto.to,
      dto.status,
    );

    return reservations.map((r) => ({
      id: r.id,
      reservationDate: r.reservationDate,
      paymentMethod: r.paymentMethod.value,
      status: r.status.value,
      ticketId: r.ticketId,
      createdAt: r.createdAt,
    }));
  }
}
