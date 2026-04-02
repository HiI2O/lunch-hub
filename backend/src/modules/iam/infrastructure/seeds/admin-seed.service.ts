import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { PasswordHasher } from '../../domain/services/password-hasher.interface.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UniqueId } from '../../../../shared/domain/identifier.js';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const displayName = this.configService.get<string>('ADMIN_DISPLAY_NAME');

    if (!email || !password || !displayName) {
      this.logger.warn(
        'Admin seed skipped: ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_DISPLAY_NAME not set',
      );
      return;
    }

    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      this.logger.log('Admin user already exists, skipping seed');
      return;
    }

    const user = User.invite({
      id: UniqueId.create().value,
      email: EmailAddress.create(email),
      role: Role.create('ADMINISTRATOR'),
      invitedBy: null,
    });

    const hashedPassword = await this.passwordHasher.hash(password);
    user.activate(
      PasswordHash.create(hashedPassword),
      DisplayName.create(displayName),
    );
    user.clearDomainEvents();

    await this.userRepository.save(user);
    this.logger.log(`Admin user seeded: ${email}`);
  }
}
