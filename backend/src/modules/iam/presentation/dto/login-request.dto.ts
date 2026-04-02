import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
