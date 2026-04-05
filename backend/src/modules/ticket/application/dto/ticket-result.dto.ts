export interface TicketResultDto {
  readonly id: string;
  readonly ownerId: string;
  readonly remainingCount: number;
  readonly status: string;
  readonly purchaseDate: string;
}
