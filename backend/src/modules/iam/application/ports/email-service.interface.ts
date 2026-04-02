export interface SendEmailParams {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
}

export abstract class IEmailService {
  abstract send(params: SendEmailParams): Promise<void>;
}
