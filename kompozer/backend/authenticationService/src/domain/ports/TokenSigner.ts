/**
 * Domain port for JWT signing and verification.
 *
 * Abstracts cryptographic implementation (jsonwebtoken in production,
 * fake signers in tests). Payload includes userId, tokenId (linked to DB session), and role.
 */
import { UserRole } from '../entities/UserRole';

export interface TokenPayload {
  userId: string;
  tokenId: string;
  role: UserRole;
}

export interface TokenSigner {
  sign(payload: TokenPayload, expiresIn: number): string;
  verify(token: string): TokenPayload;
}
