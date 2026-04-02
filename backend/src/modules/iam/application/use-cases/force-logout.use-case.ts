import { ISessionRepository } from '../../domain/repositories/session.repository.js';

export class ForceLogoutUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(userId: string): Promise<void> {
    await this.sessionRepository.deleteAllByUserId(userId);
  }
}
