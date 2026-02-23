export interface TokenPayload {
  readonly userId: string;
  readonly email: string;
  readonly role: string;
}

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export abstract class ITokenService {
  abstract generateTokenPair(payload: TokenPayload): Promise<TokenPair>;
  abstract verifyAccessToken(token: string): Promise<TokenPayload>;
  abstract verifyRefreshToken(token: string): Promise<TokenPayload>;
}
