/**
 * Value object representing an authenticated session.
 *
 * Tracks token lifecycle events: creation (loggedIn), expiry (expiresAt),
 * voluntary logout (loggedOut), and forced revocation (isRevoked).
 * tokenId links the session to the corresponding signed JWT.
 */
export interface Session {
  id: string;
  userId: string;
  tokenId: string;
  loggedIn: Date;
  expiresAt: Date;
  loggedOut: Date | null;
  isRevoked: boolean;
}
