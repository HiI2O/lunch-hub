import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import type { CalendarDataDto } from '../dto/calendar-data.dto.js';

interface GetCalendarDataInput {
  readonly userId: string;
  readonly year: number;
  readonly month: number;
}

export class GetCalendarDataUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(dto: GetCalendarDataInput): Promise<CalendarDataDto> {
    const reservations = await this.reservationRepository.findCalendarData(
      dto.userId,
      dto.year,
      dto.month,
    );

    const result: CalendarDataDto = {};
    for (const r of reservations) {
      result[r.reservationDate] = {
        hasReservation: true,
        status: r.status.value,
      };
    }

    return result;
  }
}
