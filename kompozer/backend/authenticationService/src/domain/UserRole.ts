// UserRole — Enum dei ruoli utente del sistema.
// Definisce i tre livelli di accesso: GUEST (sessione ospite anonima),
// BASE (utente registrato standard) e ADMIN (amministratore con privilegi estesi).
export enum UserRole {
  GUEST = 'GUEST',
  BASE = 'BASE',
  ADMIN = 'ADMIN',
}
