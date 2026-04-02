import { IsEmail, IsString, IsIn } from 'class-validator';

export class InviteRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsIn(['GENERAL_USER', 'STAFF', 'ADMINISTRATOR'])
  role!: string;
}
