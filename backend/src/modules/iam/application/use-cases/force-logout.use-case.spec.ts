/* eslint-disable @typescript-eslint/unbound-method */
import { ForceLogoutUseCase } from './force-logout.use-case.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.js';

describe('ForceLogoutUseCase', () => {
  let useCase: ForceLogoutUseCase;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  beforeEach(() => {
    sessionRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByRefreshToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ForceLogoutUseCase(sessionRepository);
  });

  it('should delete all sessions for the user', async () => {
    await useCase.execute('user-id-001');

    expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledWith(
      'user-id-001',
    );
    expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledTimes(1);
  });

  it('should not throw when user has no sessions', async () => {
    await expect(useCase.execute('user-id-002')).resolves.toBeUndefined();
  });

  it('should call deleteAllByUserId with correct userId', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    await useCase.execute(userId);

    expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledWith(userId);
  });
});
