/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserController } from './admin-user.controller.js';
import { InviteUserUseCase } from '../../application/use-cases/invite-user.use-case.js';
import { GetUserListUseCase } from '../../application/use-cases/get-user-list.use-case.js';
import { ResendInvitationUseCase } from '../../application/use-cases/resend-invitation.use-case.js';
import { CancelInvitationUseCase } from '../../application/use-cases/cancel-invitation.use-case.js';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user.use-case.js';
import { ReactivateUserUseCase } from '../../application/use-cases/reactivate-user.use-case.js';
import { ChangeRoleUseCase } from '../../application/use-cases/change-role.use-case.js';
import { ForceLogoutUseCase } from '../../application/use-cases/force-logout.use-case.js';
import type { CurrentUserData } from '../decorators/current-user.decorator.js';
import type { UserProfileDto } from '../../application/dto/user-profile.dto.js';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  let inviteUserUseCase: jest.Mocked<InviteUserUseCase>;
  let getUserListUseCase: jest.Mocked<GetUserListUseCase>;
  let resendInvitationUseCase: jest.Mocked<ResendInvitationUseCase>;
  let cancelInvitationUseCase: jest.Mocked<CancelInvitationUseCase>;
  let deactivateUserUseCase: jest.Mocked<DeactivateUserUseCase>;
  let reactivateUserUseCase: jest.Mocked<ReactivateUserUseCase>;
  let changeRoleUseCase: jest.Mocked<ChangeRoleUseCase>;
  let forceLogoutUseCase: jest.Mocked<ForceLogoutUseCase>;

  const adminUser: CurrentUserData = {
    userId: 'admin-1',
    email: 'admin@example.com',
    role: 'ADMINISTRATOR',
  };

  beforeEach(async () => {
    inviteUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<InviteUserUseCase>;
    getUserListUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUserListUseCase>;
    resendInvitationUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResendInvitationUseCase>;
    cancelInvitationUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CancelInvitationUseCase>;
    deactivateUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeactivateUserUseCase>;
    reactivateUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ReactivateUserUseCase>;
    changeRoleUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ChangeRoleUseCase>;
    forceLogoutUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ForceLogoutUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        { provide: InviteUserUseCase, useValue: inviteUserUseCase },
        { provide: GetUserListUseCase, useValue: getUserListUseCase },
        {
          provide: ResendInvitationUseCase,
          useValue: resendInvitationUseCase,
        },
        {
          provide: CancelInvitationUseCase,
          useValue: cancelInvitationUseCase,
        },
        { provide: DeactivateUserUseCase, useValue: deactivateUserUseCase },
        { provide: ReactivateUserUseCase, useValue: reactivateUserUseCase },
        { provide: ChangeRoleUseCase, useValue: changeRoleUseCase },
        { provide: ForceLogoutUseCase, useValue: forceLogoutUseCase },
      ],
    }).compile();

    controller = module.get<AdminUserController>(AdminUserController);
  });

  describe('invite', () => {
    it('ユーザー招待成功時にuserIdとemailを返す', async () => {
      inviteUserUseCase.execute.mockResolvedValue({
        userId: 'new-user-1',
        email: 'new@example.com',
      });

      const result = await controller.invite(
        { email: 'new@example.com', role: 'GENERAL_USER' },
        adminUser,
      );

      expect(inviteUserUseCase.execute).toHaveBeenCalledWith(
        { email: 'new@example.com', role: 'GENERAL_USER' },
        'admin-1',
      );
      expect(result.data.userId).toBe('new-user-1');
      expect(result.data.email).toBe('new@example.com');
    });
  });

  describe('list', () => {
    it('ユーザー一覧を返す', async () => {
      const mockUsers: UserProfileDto[] = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          displayName: 'User 1',
          role: 'GENERAL_USER',
          status: 'ACTIVE',
          lastLoginAt: null,
          createdAt: new Date('2025-01-01'),
        },
      ];
      getUserListUseCase.execute.mockResolvedValue(mockUsers);

      const result = await controller.list();

      expect(getUserListUseCase.execute).toHaveBeenCalled();
      expect(result.data).toEqual(mockUsers);
    });
  });

  describe('resendInvitation', () => {
    it('招待再送成功時にメッセージを返す', async () => {
      resendInvitationUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.resendInvitation('user-1');

      expect(resendInvitationUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result.data.message).toBe('Invitation resent');
    });
  });

  describe('cancelInvitation', () => {
    it('招待キャンセル成功時にメッセージを返す', async () => {
      cancelInvitationUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.cancelInvitation('user-1');

      expect(cancelInvitationUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result.data.message).toBe('Invitation cancelled');
    });
  });

  describe('deactivate', () => {
    it('ユーザー無効化成功時にメッセージを返す', async () => {
      deactivateUserUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deactivate('user-1');

      expect(deactivateUserUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result.data.message).toBe('User deactivated');
    });
  });

  describe('reactivate', () => {
    it('ユーザー再有効化成功時にメッセージを返す', async () => {
      reactivateUserUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.reactivate('user-1');

      expect(reactivateUserUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result.data.message).toBe('User reactivated');
    });
  });

  describe('changeRole', () => {
    it('ロール変更成功時にメッセージを返す', async () => {
      changeRoleUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.changeRole('user-1', {
        role: 'STAFF',
      });

      expect(changeRoleUseCase.execute).toHaveBeenCalledWith('user-1', 'STAFF');
      expect(result.data.message).toBe('Role changed');
    });
  });

  describe('forceLogout', () => {
    it('強制ログアウト成功時にメッセージを返す', async () => {
      forceLogoutUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.forceLogout('user-1');

      expect(forceLogoutUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result.data.message).toBe('User sessions cleared');
    });
  });
});
