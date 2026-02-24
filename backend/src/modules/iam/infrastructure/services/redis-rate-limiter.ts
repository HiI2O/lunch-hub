import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { IRateLimiter } from '../../application/ports/rate-limiter.interface.js';

@Injectable()
export class RedisRateLimiter extends IRateLimiter {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  async isRateLimited(
    key: string,
    maxAttempts: number,
    windowSeconds: number,
  ): Promise<boolean> {
    void windowSeconds;
    const current = await this.redis.get(key);
    if (current === null) {
      return false;
    }
    return parseInt(current, 10) >= maxAttempts;
  }

  async increment(key: string, windowSeconds: number): Promise<void> {
    const result = await this.redis.incr(key);
    if (result === 1) {
      await this.redis.expire(key, windowSeconds);
    }
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
