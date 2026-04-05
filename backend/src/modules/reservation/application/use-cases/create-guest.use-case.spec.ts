/* eslint-disable @typescript-eslint/unbound-method */
import { CreateGuestUseCase } from './create-guest.use-case.js';
import type { IGuestRepository } from '../../domain/repositories/guest.repository.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

function createMockRepository(): jest.Mocked<IGuestRepository> {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn().mockResolvedValue(null),
    findByVisitDate: jest.fn().mockResolvedValue([]),
  };
}

describe('CreateGuestUseCase', () => {
  let useCase: CreateGuestUseCase;
  let repository: jest.Mocked<IGuestRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new CreateGuestUseCase(repository);
  });

  it('ゲストを作成してリポジトリに保存する', async () => {
    const result = await useCase.execute({
      guestName: '来客A様',
      createdByStaffId: 'staff-id-1',
    });

    expect(result.guestName).toBe('来客A様');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('空のゲスト名ではValidationErrorを投げる', async () => {
    await expect(
      useCase.execute({ guestName: '', createdByStaffId: 'staff-id-1' }),
    ).rejects.toThrow(ValidationError);
  });
});
