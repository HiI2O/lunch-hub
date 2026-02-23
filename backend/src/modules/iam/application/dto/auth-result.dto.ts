export interface AuthResultDto {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly role: string;
  };
}
