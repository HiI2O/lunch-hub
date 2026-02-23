import type { Session } from '../aggregates/session.js';

export abstract class ISessionRepository {
  abstract save(session: Session): Promise<void>;
  abstract findById(id: string): Promise<Session | null>;
  abstract findByRefreshToken(token: string): Promise<Session | null>;
  abstract findByUserId(userId: string): Promise<readonly Session[]>;
  abstract delete(id: string): Promise<void>;
  abstract deleteAllByUserId(userId: string): Promise<void>;
}
