export interface PurchaseReservationResultDto {
  readonly id: string;
  readonly userId: string;
  readonly purchaseDate: string;
  readonly quantity: number;
  readonly totalTickets: number;
  readonly status: string;
  readonly ticketId: string | null;
}
