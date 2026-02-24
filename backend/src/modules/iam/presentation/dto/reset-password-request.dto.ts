import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordRequestDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message: 'Password must contain letter, digit, and special character',
  })
  newPassword!: string;
}
