import { registerAs } from '@nestjs/config';

export interface MailConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly pass: string;
  readonly from: string;
}

export const mailConfig = registerAs(
  'mail',
  (): MailConfig => ({
    host: process.env['SMTP_HOST'] ?? 'localhost',
    port: parseInt(process.env['SMTP_PORT'] ?? '1025', 10),
    user: process.env['SMTP_USER'] ?? '',
    pass: process.env['SMTP_PASS'] ?? '',
    from: process.env['MAIL_FROM'] ?? 'noreply@lunch-hub.local',
  }),
);
