import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SignupRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  pin!: string;
}
