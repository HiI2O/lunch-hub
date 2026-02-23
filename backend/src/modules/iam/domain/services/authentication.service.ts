import type { User } from '../aggregates/user.js';
import type { PasswordHasher } from './password-hasher.interface.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export class AuthenticationService {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  async verifyCredentials(user: User, plainPassword: string): Promise<boolean> {
    if (!user.canLogin()) {
      throw new ValidationError('User cannot login');
    }
    const hash = user.passwordHash;
    if (hash === null) {
      return false;
    }
    return this.passwordHasher.compare(plainPassword, hash.value);
  }
}
