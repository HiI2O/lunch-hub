import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { IEmailService } from '../ports/email-service.interface.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

export class ResendInvitationUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly appUrl: string,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User', userId);
    }

    user.refreshInvitationToken();
    await this.userRepository.save(user);

    const invitationToken = user.invitationToken;
    const activationUrl = `${this.appUrl}/activate?token=${invitationToken?.token ?? ''}`;

    await this.emailService.send({
      to: user.email.value,
      subject: 'Lunch Hub - 招待（再送）',
      html: `<p>Lunch Hubへ招待されました。以下のリンクからアカウントを有効化してください。</p><p><a href="${activationUrl}">${activationUrl}</a></p>`,
    });
  }
}
