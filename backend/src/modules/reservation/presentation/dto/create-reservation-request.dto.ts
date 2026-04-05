import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateReservationRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'reservationDate must be YYYY-MM-DD format',
  })
  reservationDate!: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  ticketId?: string;
}
