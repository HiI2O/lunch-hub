import { registerAs } from '@nestjs/config';

export interface AppConfig {
  readonly appUrl: string;
  readonly port: number;
  readonly timezone: string;
  readonly companyPin: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    appUrl: process.env['APP_URL'] ?? 'http://localhost:5173',
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    timezone: process.env['TZ'] ?? 'Asia/Tokyo',
    companyPin: process.env['COMPANY_PIN'] ?? '',
  }),
);
