// Session — Value object che rappresenta una sessione autenticata.
// Tiene traccia del ciclo di vita del token: creazione (loggedIn), scadenza (expiresAt),
// logout volontario (loggedOut) e revoca forzata (isRevoked).
// Il campo tokenId collega la sessione al JWT firmato corrispondente.
export interface Session {
  id: string;
  userId: string;
  tokenId: string;
  loggedIn: Date;
  expiresAt: Date;
  loggedOut: Date | null;
  isRevoked: boolean;
}
