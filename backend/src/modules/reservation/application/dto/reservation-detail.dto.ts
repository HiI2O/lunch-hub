export interface ReservationDetailDto {
  readonly id: string;
  readonly reservationDate: string;
  readonly paymentMethod: string;
  readonly status: string;
  readonly ticketId: string | null;
  readonly orderId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
