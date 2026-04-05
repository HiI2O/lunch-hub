import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ModifyReservationRequestDto {
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  ticketId?: string;
}
