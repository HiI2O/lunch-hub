import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import {
  IEmailService,
  type SendEmailParams,
} from '../../application/ports/email-service.interface.js';

@Injectable()
export class NodemailerEmailService extends IEmailService {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(configService: ConfigService) {
    super();
    this.transporter = createTransport({
      host: configService.get<string>('mail.host'),
      port: configService.get<number>('mail.port'),
      secure: configService.get<boolean>('mail.secure', false),
      auth: {
        user: configService.get<string>('mail.user'),
        pass: configService.get<string>('mail.pass'),
      },
    });
    this.fromAddress =
      configService.get<string>('mail.from') ?? 'noreply@lunch-hub.local';
  }

  async send(params: SendEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
