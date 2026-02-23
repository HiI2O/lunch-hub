import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  readonly host: string;
  readonly port: number;
}

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
  }),
);
