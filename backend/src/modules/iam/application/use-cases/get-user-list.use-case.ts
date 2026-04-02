import { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { UserProfileDto } from '../dto/user-profile.dto.js';

export class GetUserListUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<readonly UserProfileDto[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      email: user.email.value,
      displayName: user.displayName?.value ?? null,
      role: user.role.value,
      status: user.status.value,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }));
  }
}
