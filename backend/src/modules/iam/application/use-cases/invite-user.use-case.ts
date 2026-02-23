import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { IEmailService } from '../ports/email-service.interface.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { Role } from '../../domain/value-objects/role.js';
import { ConflictError } from '../../../../shared/domain/errors/conflict.error.js';
import type { InviteUserDto } from '../dto/invite-user.dto.js';

interface InviteUserResult {
  readonly userId: string;
  readonly email: string;
}

export class InviteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly appUrl: string,
  ) {}

  async execute(
    dto: InviteUserDto,
    invitedBy: string,
  ): Promise<InviteUserResult> {
    const emailExists = await this.userRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const email = EmailAddress.create(dto.email);
    const role = Role.create(dto.role);
    const userId = crypto.randomUUID();

    const user = User.invite({
      id: userId,
      email,
      role,
      invitedBy,
    });

    await this.userRepository.save(user);

    const invitationToken = user.invitationToken;
    const activationUrl = `${this.appUrl}/activate?token=${invitationToken?.token ?? ''}`;

    await this.emailService.send({
      to: dto.email,
      subject: 'Lunch Hub - 招待',
      html: `<p>Lunch Hubへ招待されました。以下のリンクからアカウントを有効化してください。</p><p><a href="${activationUrl}">${activationUrl}</a></p>`,
    });

    return {
      userId,
      email: dto.email,
    };
  }
}
