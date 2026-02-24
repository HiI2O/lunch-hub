import { JwtTokenService } from './jwt-token.service.js';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let mockJwtService: jest.Mocked<
    Pick<JwtService, 'signAsync' | 'verifyAsync'>
  >;
  let mockConfigService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const accessSecret = 'test-access-secret';
  const refreshSecret = 'test-refresh-secret';

  beforeEach(() => {
    mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.accessSecret') return accessSecret;
        if (key === 'jwt.refreshSecret') return refreshSecret;
        return undefined;
      }),
    };

    service = new JwtTokenService(
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token-value')
        .mockResolvedValueOnce('refresh-token-value');

      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      };

      const result = await service.generateTokenPair(payload);

      expect(result.accessToken).toBe('access-token-value');
      expect(result.refreshToken).toBe('refresh-token-value');
    });

    it('should sign access token with access secret and 15m expiry', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access')
        .mockResolvedValueOnce('refresh');

      await service.generateTokenPair({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId: 'user-123', email: 'test@example.com', role: 'GENERAL_USER' },
        { secret: accessSecret, expiresIn: '15m' },
      );
    });

    it('should sign refresh token with refresh secret and 7d expiry', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access')
        .mockResolvedValueOnce('refresh');

      await service.generateTokenPair({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId: 'user-123', email: 'test@example.com', role: 'GENERAL_USER' },
        { secret: refreshSecret, expiresIn: '7d' },
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify token with access secret', async () => {
      const expectedPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      };
      mockJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      const result = await service.verifyAccessToken('some-access-token');

      expect(result).toEqual(expectedPayload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'some-access-token',
        { secret: accessSecret },
      );
    });

    it('should propagate error for invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(service.verifyAccessToken('bad-token')).rejects.toThrow(
        'invalid token',
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify token with refresh secret', async () => {
      const expectedPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'GENERAL_USER',
      };
      mockJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      const result = await service.verifyRefreshToken('some-refresh-token');

      expect(result).toEqual(expectedPayload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'some-refresh-token',
        { secret: refreshSecret },
      );
    });

    it('should propagate error for invalid refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.verifyRefreshToken('expired-token')).rejects.toThrow(
        'jwt expired',
      );
    });
  });
});
