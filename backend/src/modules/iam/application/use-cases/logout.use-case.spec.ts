/* eslint-disable @typescript-eslint/unbound-method */
import { LogoutUseCase } from './logout.use-case.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { Session } from '../../domain/aggregates/session.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createValidSession(): Session {
  return Session.reconstruct({
    id: 'session-id-001',
    userId: 'user-id-001',
    refreshToken: 'refresh-token-abc',
    isRevoked: false,
    createdAt: new Date(),
    lastAccessedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  beforeEach(() => {
    sessionRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByRefreshToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      deleteAllByUserId: jest.fn(),
    };

    useCase = new LogoutUseCase(sessionRepository);
  });

  it('should revoke and delete session on successful logout', async () => {
    const session = createValidSession();
    sessionRepository.findById.mockResolvedValue(session);

    await useCase.execute('session-id-001');

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    expect(sessionRepository.delete).toHaveBeenCalledWith('session-id-001');
  });

  it('should throw NotFoundError when session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should call save before delete', async () => {
    const session = createValidSession();
    sessionRepository.findById.mockResolvedValue(session);

    const callOrder: string[] = [];
    sessionRepository.save.mockImplementation(() => {
      callOrder.push('save');
      return Promise.resolve();
    });
    sessionRepository.delete.mockImplementation(() => {
      callOrder.push('delete');
      return Promise.resolve();
    });

    await useCase.execute('session-id-001');

    expect(callOrder).toEqual(['save', 'delete']);
  });
});
