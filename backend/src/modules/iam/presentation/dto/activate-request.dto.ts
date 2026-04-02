import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ActivateRequestDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message: 'Password must contain letter, digit, and special character',
  })
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  displayName!: string;
}
