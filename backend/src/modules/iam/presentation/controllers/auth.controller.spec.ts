/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js';
import { SelfSignUpUseCase } from '../../application/use-cases/self-sign-up.use-case.js';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.use-case.js';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case.js';
import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import type { Response, Request } from 'express';
import type { CurrentUserData } from '../decorators/current-user.decorator.js';

function createMockResponse(): Response {
  const res = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function createMockRequest(cookies: Record<string, string> = {}): Request {
  return { cookies } as unknown as Request;
}

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let selfSignUpUseCase: jest.Mocked<SelfSignUpUseCase>;
  let activateUserUseCase: jest.Mocked<ActivateUserUseCase>;
  let requestPasswordResetUseCase: jest.Mocked<RequestPasswordResetUseCase>;
  let resetPasswordUseCase: jest.Mocked<ResetPasswordUseCase>;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  beforeEach(async () => {
    loginUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LoginUseCase>;

    logoutUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LogoutUseCase>;

    refreshTokenUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenUseCase>;

    selfSignUpUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SelfSignUpUseCase>;

    activateUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ActivateUserUseCase>;

    requestPasswordResetUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RequestPasswordResetUseCase>;

    resetPasswordUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResetPasswordUseCase>;

    sessionRepository = {
      findByRefreshToken: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn(),
    } as unknown as jest.Mocked<ISessionRepository>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: loginUseCase },
        { provide: LogoutUseCase, useValue: logoutUseCase },
        { provide: RefreshTokenUseCase, useValue: refreshTokenUseCase },
        { provide: SelfSignUpUseCase, useValue: selfSignUpUseCase },
        { provide: ActivateUserUseCase, useValue: activateUserUseCase },
        {
          provide: RequestPasswordResetUseCase,
          useValue: requestPasswordResetUseCase,
        },
        { provide: ResetPasswordUseCase, useValue: resetPasswordUseCase },
        { provide: ISessionRepository, useValue: sessionRepository },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('ログイン成功時にaccessTokenとuserを返しcookieを設定する', async () => {
      const mockResult = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'GENERAL_USER',
        },
      };
      loginUseCase.execute.mockResolvedValue(mockResult);

      const res = createMockResponse();
      const result = await controller.login(
        { email: 'test@example.com', password: 'Password1!' },
        res,
      );

      expect(loginUseCase.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1!',
      });
      expect(result.data.accessToken).toBe('access-token-123');
      expect(result.data.user.email).toBe('test@example.com');
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-456',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/auth',
        }),
      );
    });
  });

  describe('logout', () => {
    it('refreshTokenのcookieからセッションを特定してログアウトする', async () => {
      const currentUser: CurrentUserData = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      };
      const mockSession = { id: 'session-1' };
      sessionRepository.findByRefreshToken.mockResolvedValue(
        mockSession as never,
      );
      logoutUseCase.execute.mockResolvedValue(undefined);

      const req = createMockRequest({
        refreshToken: 'refresh-token-456',
      });
      const res = createMockResponse();

      const result = await controller.logout(currentUser, req, res);

      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        'refresh-token-456',
      );
      expect(logoutUseCase.execute).toHaveBeenCalledWith('session-1');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', {
        path: '/api/auth',
      });
      expect(result.data.message).toBe('Logged out');
    });

    it('refreshTokenがない場合もcookieをクリアして正常終了する', async () => {
      const currentUser: CurrentUserData = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      };
      const req = createMockRequest({});
      const res = createMockResponse();

      const result = await controller.logout(currentUser, req, res);

      expect(logoutUseCase.execute).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(result.data.message).toBe('Logged out');
    });
  });

  describe('refresh', () => {
    it('cookieのrefreshTokenで新しいaccessTokenを返す', async () => {
      refreshTokenUseCase.execute.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const req = createMockRequest({
        refreshToken: 'refresh-token-456',
      });

      const result = await controller.refresh(req);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
        'refresh-token-456',
      );
      expect(result.data.accessToken).toBe('new-access-token');
    });

    it('refreshTokenがない場合はValidationErrorをスローする', async () => {
      const req = createMockRequest({});

      await expect(controller.refresh(req)).rejects.toThrow(
        'Refresh token is required',
      );
    });
  });

  describe('signup', () => {
    it('サインアップ成功時にメッセージを返す', async () => {
      selfSignUpUseCase.execute.mockResolvedValue({
        message: 'Invitation email sent',
      });

      const result = await controller.signup({
        email: 'new@example.com',
        pin: '1234',
      });

      expect(selfSignUpUseCase.execute).toHaveBeenCalledWith({
        email: 'new@example.com',
        pin: '1234',
      });
      expect(result.data.message).toBe('Invitation email sent');
    });
  });

  describe('activate', () => {
    it('アクティベーション成功時にaccessTokenとuserを返す', async () => {
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          displayName: 'Test',
          role: 'GENERAL_USER',
        },
      };
      activateUserUseCase.execute.mockResolvedValue(mockResult);

      const res = createMockResponse();
      const result = await controller.activate(
        {
          token: 'invite-token',
          password: 'Password1!',
          displayName: 'Test',
        },
        res,
      );

      expect(activateUserUseCase.execute).toHaveBeenCalledWith({
        token: 'invite-token',
        password: 'Password1!',
        displayName: 'Test',
      });
      expect(result.data.accessToken).toBe('access-token');
      expect(res.cookie).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('常に同じメッセージを返す（情報漏洩防止）', async () => {
      requestPasswordResetUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.forgotPassword({
        email: 'test@example.com',
      });

      expect(requestPasswordResetUseCase.execute).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result.data.message).toBe(
        'If the email exists, a reset link has been sent',
      );
    });
  });

  describe('resetPassword', () => {
    it('パスワードリセット成功時にメッセージを返す', async () => {
      resetPasswordUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.resetPassword({
        token: 'reset-token',
        newPassword: 'NewPassword1!',
      });

      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(
        'reset-token',
        'NewPassword1!',
      );
      expect(result.data.message).toBe('Password has been reset');
    });
  });
});
