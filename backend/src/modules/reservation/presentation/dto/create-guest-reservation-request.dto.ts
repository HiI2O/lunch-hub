import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateGuestReservationRequestDto {
  @IsString()
  @IsNotEmpty()
  guestId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'reservationDate must be YYYY-MM-DD format',
  })
  reservationDate!: string;
}
