export interface ActivateUserDto {
  readonly token: string;
  readonly password: string;
  readonly displayName: string;
}
