import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

export class CancelInvitationUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User', userId);
    }

    user.cancelInvitation();
    await this.userRepository.save(user);
  }
}
