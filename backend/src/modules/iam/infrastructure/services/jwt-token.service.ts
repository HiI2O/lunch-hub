import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ITokenService,
  type TokenPayload,
  type TokenPair,
} from '../../application/ports/token-service.interface.js';

@Injectable()
export class JwtTokenService extends ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    super();
    this.accessSecret = configService.get<string>('jwt.accessSecret') ?? '';
    this.refreshSecret = configService.get<string>('jwt.refreshSecret') ?? '';
  }

  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId: payload.userId, email: payload.email, role: payload.role },
        { secret: this.accessSecret, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { userId: payload.userId, email: payload.email, role: payload.role },
        { secret: this.refreshSecret, expiresIn: '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.refreshSecret,
    });
  }
}
