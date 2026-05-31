// TokenSigner — Porta di dominio per la firma e la verifica dei JWT.
// Astrae la libreria crittografica (jsonwebtoken in produzione, FakeTokenSigner nei test).
// Il payload include userId, tokenId (per collegare il token alla sessione DB) e il ruolo.
import { UserRole } from './UserRole';

export interface TokenPayload {
  userId: string;
  tokenId: string;
  role: UserRole;
}

export interface TokenSigner {
  sign(payload: TokenPayload, expiresIn: number): string;
  verify(token: string): TokenPayload;
}
