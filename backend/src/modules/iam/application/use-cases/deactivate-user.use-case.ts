import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

export class DeactivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User', userId);
    }

    user.deactivate();
    await this.userRepository.save(user);
    await this.sessionRepository.deleteAllByUserId(userId);
  }
}
