export interface OrderResultDto {
  readonly id: string;
  readonly orderDate: string;
  readonly totalCount: number;
  readonly status: string;
  readonly placedAt: string | null;
}
