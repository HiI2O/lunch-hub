import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js';
import { SelfSignUpUseCase } from '../../application/use-cases/self-sign-up.use-case.js';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.use-case.js';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case.js';
import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { DomainExceptionFilter } from '../../../../shared/presentation/filters/domain-exception.filter.js';
import { LoginRequestDto } from '../dto/login-request.dto.js';
import { SignupRequestDto } from '../dto/signup-request.dto.js';
import { ActivateRequestDto } from '../dto/activate-request.dto.js';
import { ForgotPasswordRequestDto } from '../dto/forgot-password-request.dto.js';
import { ResetPasswordRequestDto } from '../dto/reset-password-request.dto.js';
import {
  CurrentUser,
  type CurrentUserData,
} from '../decorators/current-user.decorator.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_PATH = '/api/auth';

@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly selfSignUpUseCase: SelfSignUpUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    data: {
      accessToken: string;
      user: {
        id: string;
        email: string;
        displayName: string;
        role: string;
      };
    };
  }> {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() currentUser: CurrentUserData,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: { message: string } }> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      'refreshToken'
    ];

    if (refreshToken) {
      const session =
        await this.sessionRepository.findByRefreshToken(refreshToken);
      if (session !== null) {
        await this.logoutUseCase.execute(session.id);
      }
    }

    this.clearRefreshTokenCookie(res);

    void currentUser;

    return { data: { message: 'Logged out' } };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
  ): Promise<{ data: { accessToken: string } }> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      'refreshToken'
    ];

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    return { data: { accessToken: result.accessToken } };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() dto: SignupRequestDto,
  ): Promise<{ data: { message: string } }> {
    const result = await this.selfSignUpUseCase.execute({
      email: dto.email,
      pin: dto.pin,
    });

    return { data: { message: result.message } };
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Body() dto: ActivateRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    data: {
      accessToken: string;
      user: {
        id: string;
        email: string;
        displayName: string;
        role: string;
      };
    };
  }> {
    const result = await this.activateUserUseCase.execute({
      token: dto.token,
      password: dto.password,
      displayName: dto.displayName,
    });

    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<{ data: { message: string } }> {
    await this.requestPasswordResetUseCase.execute(dto.email);

    return {
      data: { message: 'If the email exists, a reset link has been sent' },
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<{ data: { message: string } }> {
    await this.resetPasswordUseCase.execute(dto.token, dto.newPassword);

    return { data: { message: 'Password has been reset' } };
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: REFRESH_TOKEN_COOKIE_PATH,
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken', { path: REFRESH_TOKEN_COOKIE_PATH });
  }
}
