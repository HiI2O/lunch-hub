import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { Session } from '../../domain/aggregates/session.js';

const SESSION_TTL = 604800; // 7 days in seconds

interface SessionData {
  readonly id: string;
  readonly userId: string;
  readonly refreshToken: string;
  readonly isRevoked: boolean;
  readonly createdAt: string;
  readonly lastAccessedAt: string;
  readonly expiresAt: string;
}

@Injectable()
export class RedisSessionRepository extends ISessionRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  async save(session: Session): Promise<void> {
    const data: SessionData = {
      id: session.id,
      userId: session.userId,
      refreshToken: session.refreshToken,
      isRevoked: session.isRevoked,
      createdAt: session.createdAt.toISOString(),
      lastAccessedAt: session.lastAccessedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    };

    const pipeline = this.redis.pipeline();
    pipeline.set(
      this.sessionKey(session.id),
      JSON.stringify(data),
      'EX',
      SESSION_TTL,
    );
    pipeline.set(
      this.refreshTokenKey(session.refreshToken),
      session.id,
      'EX',
      SESSION_TTL,
    );
    pipeline.sadd(this.userSessionsKey(session.userId), session.id);
    pipeline.expire(this.userSessionsKey(session.userId), SESSION_TTL);
    await pipeline.exec();
  }

  async findById(id: string): Promise<Session | null> {
    const raw = await this.redis.get(this.sessionKey(id));
    if (raw === null) {
      return null;
    }
    return this.deserialize(raw);
  }

  async findByRefreshToken(token: string): Promise<Session | null> {
    const sessionId = await this.redis.get(this.refreshTokenKey(token));
    if (sessionId === null) {
      return null;
    }
    return this.findById(sessionId);
  }

  async findByUserId(userId: string): Promise<readonly Session[]> {
    const sessionIds = await this.redis.smembers(this.userSessionsKey(userId));
    const sessions: Session[] = [];
    for (const sessionId of sessionIds) {
      const session = await this.findById(sessionId);
      if (session !== null) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  async delete(id: string): Promise<void> {
    const raw = await this.redis.get(this.sessionKey(id));
    if (raw === null) {
      return;
    }
    const data = JSON.parse(raw) as SessionData;

    const pipeline = this.redis.pipeline();
    pipeline.del(this.sessionKey(id));
    pipeline.del(this.refreshTokenKey(data.refreshToken));
    pipeline.srem(this.userSessionsKey(data.userId), id);
    await pipeline.exec();
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    const sessionIds = await this.redis.smembers(this.userSessionsKey(userId));
    for (const sessionId of sessionIds) {
      await this.delete(sessionId);
    }
    await this.redis.del(this.userSessionsKey(userId));
  }

  private sessionKey(id: string): string {
    return `session:${id}`;
  }

  private refreshTokenKey(token: string): string {
    return `refreshToken:${token}`;
  }

  private userSessionsKey(userId: string): string {
    return `user:${userId}:sessions`;
  }

  private deserialize(raw: string): Session {
    const data = JSON.parse(raw) as SessionData;
    return Session.reconstruct({
      id: data.id,
      userId: data.userId,
      refreshToken: data.refreshToken,
      isRevoked: data.isRevoked,
      createdAt: new Date(data.createdAt),
      lastAccessedAt: new Date(data.lastAccessedAt),
      expiresAt: new Date(data.expiresAt),
    });
  }
}
