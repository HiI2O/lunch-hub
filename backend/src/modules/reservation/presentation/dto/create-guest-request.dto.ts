import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGuestRequestDto {
  @IsString()
  @IsNotEmpty()
  guestName!: string;
}
