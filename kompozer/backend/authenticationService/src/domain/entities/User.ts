// User — Entità di dominio che rappresenta un utente del sistema.
// Contiene dati anagrafici, l'hash della password (mai la password in chiaro),
// il ruolo e il flag isActive. Non dipende da nessun framework esterno.
import { UserRole } from './UserRole';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
