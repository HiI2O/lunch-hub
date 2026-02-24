import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  readonly sub?: string;
  readonly userId: string;
  readonly email: string;
  readonly role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('jwt.accessSecret') ?? '';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    role: string;
  } {
    return {
      userId: payload.sub ?? payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
