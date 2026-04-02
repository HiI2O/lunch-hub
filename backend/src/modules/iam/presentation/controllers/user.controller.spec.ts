/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller.js';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case.js';
import type { CurrentUserData } from '../decorators/current-user.decorator.js';
import type { UserProfileDto } from '../../application/dto/user-profile.dto.js';

describe('UserController', () => {
  let controller: UserController;
  let getUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>;
  let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;

  const currentUser: CurrentUserData = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'GENERAL_USER',
  };

  beforeEach(async () => {
    getUserProfileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUserProfileUseCase>;

    changePasswordUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ChangePasswordUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: GetUserProfileUseCase, useValue: getUserProfileUseCase },
        { provide: ChangePasswordUseCase, useValue: changePasswordUseCase },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getMyProfile', () => {
    it('現在のユーザーのプロフィールを返す', async () => {
      const mockProfile: UserProfileDto = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'GENERAL_USER',
        status: 'ACTIVE',
        lastLoginAt: new Date('2026-01-01'),
        createdAt: new Date('2025-01-01'),
      };
      getUserProfileUseCase.execute.mockResolvedValue(mockProfile);

      const result = await controller.getMyProfile(currentUser);

      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result.data).toEqual(mockProfile);
    });
  });

  describe('changePassword', () => {
    it('パスワード変更成功時にメッセージを返す', async () => {
      changePasswordUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.changePassword(currentUser, {
        currentPassword: 'OldPassword1!',
        newPassword: 'NewPassword1!',
      });

      expect(changePasswordUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'OldPassword1!',
        'NewPassword1!',
      );
      expect(result.data.message).toBe('Password changed successfully');
    });
  });
});
