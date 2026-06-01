// JwtTokenSigner — Implementazione reale di TokenSigner.
// Firma i JWT con algoritmo HS256 usando il secret iniettato via env (JWT_SECRET).
// verify() decodifica e valida la struttura del payload prima di restituirlo,
// lanciando un errore generico per non rivelare dettagli interni al chiamante.
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
