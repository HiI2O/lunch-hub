import { IsDateString, IsInt, Min } from 'class-validator';

export class CreatePurchaseReservationRequestDto {
  @IsDateString()
  purchaseDate!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
