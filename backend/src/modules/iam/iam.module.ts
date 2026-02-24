import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Entities
import { UserEntity } from './infrastructure/persistence/entities/user.entity.js';
import { PasswordResetTokenEntity } from './infrastructure/persistence/entities/password-reset-token.entity.js';
import { AuditLogEntity } from './infrastructure/persistence/entities/audit-log.entity.js';

// Mappers
import { UserMapper } from './infrastructure/mappers/user.mapper.js';
import { PasswordResetTokenMapper } from './infrastructure/mappers/password-reset-token.mapper.js';

// Domain services
import { AuthenticationService } from './domain/services/authentication.service.js';
import { InvitationService } from './domain/services/invitation.service.js';

// Domain repository interfaces
import { IUserRepository } from './domain/repositories/user.repository.js';
import { ISessionRepository } from './domain/repositories/session.repository.js';
import { IPasswordResetTokenRepository } from './domain/repositories/password-reset-token.repository.js';

// Application ports
import { ITokenService } from './application/ports/token-service.interface.js';
import { IEmailService } from './application/ports/email-service.interface.js';
import { IRateLimiter } from './application/ports/rate-limiter.interface.js';

// Domain service interfaces
import { PasswordHasher } from './domain/services/password-hasher.interface.js';

// Infrastructure implementations
import { TypeormUserRepository } from './infrastructure/persistence/typeorm-user.repository.js';
import { TypeormPasswordResetTokenRepository } from './infrastructure/persistence/typeorm-password-reset-token.repository.js';
import { RedisSessionRepository } from './infrastructure/services/redis-session.repository.js';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.js';
import { JwtTokenService } from './infrastructure/services/jwt-token.service.js';
import { NodemailerEmailService } from './infrastructure/services/nodemailer-email.service.js';
import { RedisRateLimiter } from './infrastructure/services/redis-rate-limiter.js';
import { AuditLogService } from './infrastructure/services/audit-log.service.js';

// Use cases
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { LogoutUseCase } from './application/use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case.js';
import { SelfSignUpUseCase } from './application/use-cases/self-sign-up.use-case.js';
import { ActivateUserUseCase } from './application/use-cases/activate-user.use-case.js';
import { InviteUserUseCase } from './application/use-cases/invite-user.use-case.js';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case.js';
import { RequestPasswordResetUseCase } from './application/use-cases/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case.js';
import { ChangeRoleUseCase } from './application/use-cases/change-role.use-case.js';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case.js';
import { ReactivateUserUseCase } from './application/use-cases/reactivate-user.use-case.js';
import { ForceLogoutUseCase } from './application/use-cases/force-logout.use-case.js';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case.js';
import { GetUserListUseCase } from './application/use-cases/get-user-list.use-case.js';
import { ResendInvitationUseCase } from './application/use-cases/resend-invitation.use-case.js';
import { CancelInvitationUseCase } from './application/use-cases/cancel-invitation.use-case.js';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller.js';
import { UserController } from './presentation/controllers/user.controller.js';
import { AdminUserController } from './presentation/controllers/admin-user.controller.js';
import { JwtStrategy } from './presentation/strategies/jwt.strategy.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PasswordResetTokenEntity,
      AuditLogEntity,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController, UserController, AdminUserController],
  providers: [
    // Mappers
    UserMapper,
    PasswordResetTokenMapper,

    // Domain services
    InvitationService,
    {
      provide: AuthenticationService,
      useFactory: (hasher: PasswordHasher): AuthenticationService =>
        new AuthenticationService(hasher),
      inject: [PasswordHasher],
    },

    // Infrastructure bindings
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: IUserRepository, useClass: TypeormUserRepository },
    { provide: ISessionRepository, useClass: RedisSessionRepository },
    {
      provide: IPasswordResetTokenRepository,
      useClass: TypeormPasswordResetTokenRepository,
    },
    { provide: ITokenService, useClass: JwtTokenService },
    { provide: IEmailService, useClass: NodemailerEmailService },
    { provide: IRateLimiter, useClass: RedisRateLimiter },

    // Use cases (simple DI - NestJS resolves constructor params)
    {
      provide: LoginUseCase,
      useFactory: (
        userRepo: IUserRepository,
        sessionRepo: ISessionRepository,
        tokenService: ITokenService,
        rateLimiter: IRateLimiter,
        authService: AuthenticationService,
      ): LoginUseCase =>
        new LoginUseCase(
          userRepo,
          sessionRepo,
          tokenService,
          rateLimiter,
          authService,
        ),
      inject: [
        IUserRepository,
        ISessionRepository,
        ITokenService,
        IRateLimiter,
        AuthenticationService,
      ],
    },
    {
      provide: LogoutUseCase,
      useFactory: (sessionRepo: ISessionRepository): LogoutUseCase =>
        new LogoutUseCase(sessionRepo),
      inject: [ISessionRepository],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (
        sessionRepo: ISessionRepository,
        userRepo: IUserRepository,
        tokenService: ITokenService,
      ): RefreshTokenUseCase =>
        new RefreshTokenUseCase(sessionRepo, userRepo, tokenService),
      inject: [ISessionRepository, IUserRepository, ITokenService],
    },
    {
      provide: SelfSignUpUseCase,
      useFactory: (
        userRepo: IUserRepository,
        emailService: IEmailService,
        rateLimiter: IRateLimiter,
        config: ConfigService,
      ): SelfSignUpUseCase =>
        new SelfSignUpUseCase(
          userRepo,
          emailService,
          rateLimiter,
          config.get<string>('app.companyPin', ''),
          config.get<string>('app.appUrl', ''),
        ),
      inject: [IUserRepository, IEmailService, IRateLimiter, ConfigService],
    },
    {
      provide: ActivateUserUseCase,
      useFactory: (
        userRepo: IUserRepository,
        sessionRepo: ISessionRepository,
        tokenService: ITokenService,
        passwordHasher: PasswordHasher,
        invitationService: InvitationService,
      ): ActivateUserUseCase =>
        new ActivateUserUseCase(
          userRepo,
          sessionRepo,
          tokenService,
          passwordHasher,
          invitationService,
        ),
      inject: [
        IUserRepository,
        ISessionRepository,
        ITokenService,
        PasswordHasher,
        InvitationService,
      ],
    },
    {
      provide: InviteUserUseCase,
      useFactory: (
        userRepo: IUserRepository,
        emailService: IEmailService,
        config: ConfigService,
      ): InviteUserUseCase =>
        new InviteUserUseCase(
          userRepo,
          emailService,
          config.get<string>('app.appUrl', ''),
        ),
      inject: [IUserRepository, IEmailService, ConfigService],
    },
    {
      provide: ChangePasswordUseCase,
      useFactory: (
        userRepo: IUserRepository,
        passwordHasher: PasswordHasher,
        authService: AuthenticationService,
      ): ChangePasswordUseCase =>
        new ChangePasswordUseCase(userRepo, passwordHasher, authService),
      inject: [IUserRepository, PasswordHasher, AuthenticationService],
    },
    {
      provide: RequestPasswordResetUseCase,
      useFactory: (
        userRepo: IUserRepository,
        tokenRepo: IPasswordResetTokenRepository,
        emailService: IEmailService,
        config: ConfigService,
      ): RequestPasswordResetUseCase =>
        new RequestPasswordResetUseCase(
          userRepo,
          tokenRepo,
          emailService,
          config.get<string>('app.appUrl', ''),
        ),
      inject: [
        IUserRepository,
        IPasswordResetTokenRepository,
        IEmailService,
        ConfigService,
      ],
    },
    {
      provide: ResetPasswordUseCase,
      useFactory: (
        userRepo: IUserRepository,
        tokenRepo: IPasswordResetTokenRepository,
        passwordHasher: PasswordHasher,
        sessionRepo: ISessionRepository,
      ): ResetPasswordUseCase =>
        new ResetPasswordUseCase(
          userRepo,
          tokenRepo,
          passwordHasher,
          sessionRepo,
        ),
      inject: [
        IUserRepository,
        IPasswordResetTokenRepository,
        PasswordHasher,
        ISessionRepository,
      ],
    },
    {
      provide: ChangeRoleUseCase,
      useFactory: (userRepo: IUserRepository): ChangeRoleUseCase =>
        new ChangeRoleUseCase(userRepo),
      inject: [IUserRepository],
    },
    {
      provide: DeactivateUserUseCase,
      useFactory: (
        userRepo: IUserRepository,
        sessionRepo: ISessionRepository,
      ): DeactivateUserUseCase =>
        new DeactivateUserUseCase(userRepo, sessionRepo),
      inject: [IUserRepository, ISessionRepository],
    },
    {
      provide: ReactivateUserUseCase,
      useFactory: (userRepo: IUserRepository): ReactivateUserUseCase =>
        new ReactivateUserUseCase(userRepo),
      inject: [IUserRepository],
    },
    {
      provide: ForceLogoutUseCase,
      useFactory: (sessionRepo: ISessionRepository): ForceLogoutUseCase =>
        new ForceLogoutUseCase(sessionRepo),
      inject: [ISessionRepository],
    },
    {
      provide: GetUserProfileUseCase,
      useFactory: (userRepo: IUserRepository): GetUserProfileUseCase =>
        new GetUserProfileUseCase(userRepo),
      inject: [IUserRepository],
    },
    {
      provide: GetUserListUseCase,
      useFactory: (userRepo: IUserRepository): GetUserListUseCase =>
        new GetUserListUseCase(userRepo),
      inject: [IUserRepository],
    },
    {
      provide: ResendInvitationUseCase,
      useFactory: (
        userRepo: IUserRepository,
        emailService: IEmailService,
        config: ConfigService,
      ): ResendInvitationUseCase =>
        new ResendInvitationUseCase(
          userRepo,
          emailService,
          config.get<string>('app.appUrl', ''),
        ),
      inject: [IUserRepository, IEmailService, ConfigService],
    },
    {
      provide: CancelInvitationUseCase,
      useFactory: (userRepo: IUserRepository): CancelInvitationUseCase =>
        new CancelInvitationUseCase(userRepo),
      inject: [IUserRepository],
    },

    // Guards & Strategy
    JwtStrategy,
    RolesGuard,

    // Audit
    AuditLogService,
  ],
  exports: [IUserRepository],
})
export class IamModule {}
