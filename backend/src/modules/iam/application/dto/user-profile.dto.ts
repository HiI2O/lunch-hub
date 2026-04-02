export interface UserProfileDto {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly role: string;
  readonly status: string;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
}
