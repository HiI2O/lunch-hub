import { JwtStrategy } from './jwt.strategy.js';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('JWTペイロードからユーザー情報を抽出する（userIdフィールド使用）', () => {
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      });
    });

    it('subフィールドがある場合はそちらをuserIdとして使用する', () => {
      const payload = {
        sub: 'user-from-sub',
        userId: 'user-from-userid',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      };

      const result = strategy.validate(payload);

      expect(result.userId).toBe('user-from-sub');
    });
  });
});
