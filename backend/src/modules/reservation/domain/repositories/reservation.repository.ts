import type { Reservation } from '../aggregates/reservation.js';

export abstract class IReservationRepository {
  abstract save(reservation: Reservation): Promise<void>;
  abstract findById(id: string): Promise<Reservation | null>;
  abstract findByUserId(
    userId: string,
    from?: string,
    to?: string,
    status?: string,
  ): Promise<Reservation[]>;
  abstract findByDate(date: string): Promise<Reservation[]>;
  abstract findByUserIdAndDate(
    userId: string,
    date: string,
  ): Promise<Reservation | null>;
  abstract findCalendarData(
    userId: string,
    year: number,
    month: number,
  ): Promise<Reservation[]>;
}
