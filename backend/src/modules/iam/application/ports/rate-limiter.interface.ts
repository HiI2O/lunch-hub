export abstract class IRateLimiter {
  abstract isRateLimited(
    key: string,
    maxAttempts: number,
    windowSeconds: number,
  ): Promise<boolean>;
  abstract increment(key: string, windowSeconds: number): Promise<void>;
  abstract reset(key: string): Promise<void>;
}
