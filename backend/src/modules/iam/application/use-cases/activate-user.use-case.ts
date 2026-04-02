import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { ITokenService } from '../ports/token-service.interface.js';
import { PasswordHasher } from '../../domain/services/password-hasher.interface.js';
import { InvitationService } from '../../domain/services/invitation.service.js';
import { Session } from '../../domain/aggregates/session.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { ActivateUserDto } from '../dto/activate-user.dto.js';
import type { AuthResultDto } from '../dto/auth-result.dto.js';

const SESSION_EXPIRY_DAYS = 7;

export class ActivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: PasswordHasher,
    private readonly invitationService: InvitationService,
  ) {}

  async execute(dto: ActivateUserDto): Promise<AuthResultDto> {
    const user = await this.userRepository.findByInvitationToken(dto.token);
    if (user === null) {
      throw new NotFoundError('User', dto.token);
    }

    this.invitationService.validateInvitationToken(user, dto.token);

    const hashedPassword = await this.passwordHasher.hash(dto.password);
    const passwordHash = PasswordHash.create(hashedPassword);
    const displayName = DisplayName.create(dto.displayName);

    user.activate(passwordHash, displayName);
    await this.userRepository.save(user);

    const tokenPair = await this.tokenService.generateTokenPair({
      userId: user.id,
      email: user.email.value,
      role: user.role.value,
    });

    const expiresAt = new Date(
      Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    const session = Session.create({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshToken: tokenPair.refreshToken,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user.id,
        email: user.email.value,
        displayName: displayName.value,
        role: user.role.value,
      },
    };
  }
}
