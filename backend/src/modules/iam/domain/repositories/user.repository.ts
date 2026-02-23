import type { User } from '../aggregates/user.js';

export abstract class IUserRepository {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByInvitationToken(token: string): Promise<User | null>;
  abstract existsByEmail(email: string): Promise<boolean>;
}
