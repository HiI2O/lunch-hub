import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { Role } from '../../domain/value-objects/role.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

export class ChangeRoleUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, newRole: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User', userId);
    }

    user.changeRole(Role.create(newRole));
    await this.userRepository.save(user);
  }
}
