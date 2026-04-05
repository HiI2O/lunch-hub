import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import type { ReservationResultDto } from '../dto/reservation-result.dto.js';

interface GetAllReservationsInput {
  readonly date: string;
}

interface AllReservationsResultDto {
  readonly reservations: ReservationResultDto[];
  readonly total: number;
  readonly cashCount: number;
  readonly ticketCount: number;
}

export class GetAllReservationsUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(
    dto: GetAllReservationsInput,
  ): Promise<AllReservationsResultDto> {
    const reservations = await this.reservationRepository.findByDate(dto.date);

    const mapped = reservations.map((r) => ({
      id: r.id,
      reservationDate: r.reservationDate,
      paymentMethod: r.paymentMethod.value,
      status: r.status.value,
      ticketId: r.ticketId,
      createdAt: r.createdAt,
    }));

    const cashCount = reservations.filter((r) =>
      r.paymentMethod.isCash(),
    ).length;
    const ticketCount = reservations.filter((r) =>
      r.paymentMethod.isTicket(),
    ).length;

    return {
      reservations: mapped,
      total: reservations.length,
      cashCount,
      ticketCount,
    };
  }
}
