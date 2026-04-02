import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { PasswordHasher } from '../../domain/services/password-hasher.interface.js';
import { AuthenticationService } from '../../domain/services/authentication.service.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User', userId);
    }

    const isValid = await this.authenticationService.verifyCredentials(
      user,
      currentPassword,
    );
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword);
    const newHash = PasswordHash.create(hashedPassword);

    user.changePassword(newHash);
    await this.userRepository.save(user);
  }
}
