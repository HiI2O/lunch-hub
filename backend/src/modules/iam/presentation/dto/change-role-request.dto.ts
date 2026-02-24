import { IsString, IsIn } from 'class-validator';

export class ChangeRoleRequestDto {
  @IsString()
  @IsIn(['GENERAL_USER', 'STAFF', 'ADMINISTRATOR'])
  role!: string;
}
