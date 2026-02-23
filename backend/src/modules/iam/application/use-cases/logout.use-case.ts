import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

export class LogoutUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (session === null) {
      throw new NotFoundError('Session', sessionId);
    }

    session.revoke();
    await this.sessionRepository.save(session);
    await this.sessionRepository.delete(sessionId);
  }
}
