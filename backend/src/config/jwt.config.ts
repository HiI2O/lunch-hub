import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  readonly accessSecret: string;
  readonly refreshSecret: string;
  readonly accessExpiresIn: string;
  readonly refreshExpiresIn: string;
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    accessSecret: process.env['JWT_ACCESS_SECRET'] ?? 'dev-access-secret',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? 'dev-refresh-secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  }),
);
