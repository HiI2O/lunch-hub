import { RedisRateLimiter } from './redis-rate-limiter.js';
import type Redis from 'ioredis';

describe('RedisRateLimiter', () => {
  let limiter: RedisRateLimiter;
  let redis: jest.Mocked<Pick<Redis, 'get' | 'incr' | 'expire' | 'del'>>;

  beforeEach(() => {
    redis = {
      get: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
    };
    limiter = new RedisRateLimiter(redis as unknown as Redis);
  });

  describe('isRateLimited', () => {
    it('キーが存在しない場合、falseを返す', async () => {
      redis.get.mockResolvedValue(null);

      const result = await limiter.isRateLimited('key', 5, 60);

      expect(result).toBe(false);
    });

    it('現在値がmaxAttempts未満の場合、falseを返す', async () => {
      redis.get.mockResolvedValue('3');

      const result = await limiter.isRateLimited('key', 5, 60);

      expect(result).toBe(false);
    });

    it('現在値がmaxAttemptsと等しい場合、trueを返す', async () => {
      redis.get.mockResolvedValue('5');

      const result = await limiter.isRateLimited('key', 5, 60);

      expect(result).toBe(true);
    });

    it('現在値がmaxAttemptsを超える場合、trueを返す', async () => {
      redis.get.mockResolvedValue('10');

      const result = await limiter.isRateLimited('key', 5, 60);

      expect(result).toBe(true);
    });
  });

  describe('increment', () => {
    it('redis.incrでキーをインクリメントする', async () => {
      redis.incr.mockResolvedValue(2);

      await limiter.increment('key', 60);

      expect(redis.incr).toHaveBeenCalledWith('key');
    });

    it('初回インクリメント（結果が1）の場合、redis.expireでTTLを設定する', async () => {
      redis.incr.mockResolvedValue(1);

      await limiter.increment('key', 60);

      expect(redis.expire).toHaveBeenCalledWith('key', 60);
    });

    it('2回目以降のインクリメントではredis.expireを呼ばない', async () => {
      redis.incr.mockResolvedValue(2);

      await limiter.increment('key', 60);

      expect(redis.expire).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('redis.delでキーを削除する', async () => {
      redis.del.mockResolvedValue(1);

      await limiter.reset('key');

      expect(redis.del).toHaveBeenCalledWith('key');
    });
  });
});
