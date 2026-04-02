import { IUserRepository } from '../../domain/repositories/user.repository.js';
import {
  IPasswordResetTokenRepository,
  type PasswordResetTokenRecord,
} from '../../domain/repositories/password-reset-token.repository.js';
import { IEmailService } from '../ports/email-service.interface.js';
import { PasswordResetToken } from '../../domain/value-objects/password-reset-token.js';
import { UniqueId } from '../../../../shared/domain/identifier.js';

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly emailService: IEmailService,
    private readonly appUrl: string,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user === null) {
      return;
    }

    if (!user.isActive()) {
      return;
    }

    const token = PasswordResetToken.create();
    const record: PasswordResetTokenRecord = {
      id: UniqueId.create().value,
      userId: user.id,
      token,
    };

    await this.passwordResetTokenRepository.save(record);

    const resetUrl = `${this.appUrl}/reset-password?token=${token.token}`;

    await this.emailService.send({
      to: user.email.value,
      subject: 'Lunch Hub - パスワードリセット',
      html: `<p>パスワードリセットが要求されました。以下のリンクからパスワードをリセットしてください。</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }
}
