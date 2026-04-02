import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { IEmailService } from '../ports/email-service.interface.js';
import { IRateLimiter } from '../ports/rate-limiter.interface.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { ConflictError } from '../../../../shared/domain/errors/conflict.error.js';
import type { SignupDto } from '../dto/signup.dto.js';

const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 900; // 15 minutes

interface SelfSignUpResult {
  readonly message: string;
}

export class SelfSignUpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly rateLimiter: IRateLimiter,
    private readonly companyPin: string,
    private readonly appUrl: string,
  ) {}

  async execute(dto: SignupDto): Promise<SelfSignUpResult> {
    const rateLimitKey = `signup:attempts:${dto.email}`;

    const isLimited = await this.rateLimiter.isRateLimited(
      rateLimitKey,
      MAX_ATTEMPTS,
      WINDOW_SECONDS,
    );
    if (isLimited) {
      throw new ValidationError(
        'Too many signup attempts. Please try again later.',
      );
    }

    await this.rateLimiter.increment(rateLimitKey, WINDOW_SECONDS);

    if (!this.constantTimeCompare(dto.pin, this.companyPin)) {
      throw new ValidationError('Invalid company PIN');
    }

    const emailExists = await this.userRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const email = EmailAddress.create(dto.email);
    const user = User.selfSignUp({
      id: crypto.randomUUID(),
      email,
    });

    await this.userRepository.save(user);

    const invitationToken = user.invitationToken;
    const activationUrl = `${this.appUrl}/activate?token=${invitationToken?.token ?? ''}`;

    await this.emailService.send({
      to: dto.email,
      subject: 'Lunch Hub - アカウント有効化',
      html: `<p>以下のリンクからアカウントを有効化してください。</p><p><a href="${activationUrl}">${activationUrl}</a></p>`,
    });

    return { message: 'Invitation email sent' };
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      // Still do a comparison to avoid timing side-channel on length
      let result = a.length ^ b.length;
      for (let i = 0; i < a.length; i++) {
        result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i % b.length) ?? 0);
      }
      return result === 0;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0);
    }
    return result === 0;
  }
}
