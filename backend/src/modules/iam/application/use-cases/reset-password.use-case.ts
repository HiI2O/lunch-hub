import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { IPasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.js';
import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { PasswordHasher } from '../../domain/services/password-hasher.interface.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const record = await this.passwordResetTokenRepository.findByToken(token);
    if (record === null) {
      throw new NotFoundError('PasswordResetToken', token);
    }

    if (record.token.isExpired()) {
      throw new ValidationError('Password reset token has expired');
    }

    const user = await this.userRepository.findById(record.userId);
    if (user === null) {
      throw new NotFoundError('User', record.userId);
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword);
    const newHash = PasswordHash.create(hashedPassword);

    user.changePassword(newHash);
    await this.userRepository.save(user);

    await this.passwordResetTokenRepository.deleteByUserId(record.userId);
    await this.sessionRepository.deleteAllByUserId(record.userId);
  }
}
