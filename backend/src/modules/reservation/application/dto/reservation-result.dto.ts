export interface ReservationResultDto {
  readonly id: string;
  readonly reservationDate: string;
  readonly paymentMethod: string;
  readonly status: string;
  readonly ticketId: string | null;
  readonly createdAt: Date;
}
