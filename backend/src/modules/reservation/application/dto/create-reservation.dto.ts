export interface CreateReservationDto {
  readonly userId: string;
  readonly reservationDate: string;
  readonly paymentMethod: string;
  readonly ticketId?: string;
}
