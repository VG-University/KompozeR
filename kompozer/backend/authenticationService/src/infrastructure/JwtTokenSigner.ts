/**
 * Real implementation of TokenSigner.
 * Signs JWTs using the HS256 algorithm with the secret injected via env (JWT_SECRET).
 * verify() decodes and validates the payload structure before returning it,
 * throwing a generic error to avoid revealing internal details to the caller.
 */
import jwt from 'jsonwebtoken';
import { TokenSigner, TokenPayload } from '../domain/ports/TokenSigner';

export class JwtTokenSigner implements TokenSigner {
  constructor(private readonly secret: string) {}

  sign(payload: TokenPayload, expiresInSeconds: number): string {
    return jwt.sign(payload, this.secret, { expiresIn: expiresInSeconds });
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret);
    if (
      typeof decoded !== 'object' ||
      !decoded ||
      typeof decoded.userId !== 'string' ||
      typeof decoded.tokenId !== 'string' ||
      typeof decoded.role !== 'string'
    ) {
      throw new Error('INVALID_TOKEN');
    }
    return {
      userId: decoded.userId,
      tokenId: decoded.tokenId,
      role: decoded.role as TokenPayload['role'],
    };
  }
}
