// UserRepository — Porta di dominio (interfaccia) per la persistenza degli utenti.
// Definisce il contratto che deve rispettare qualsiasi implementazione di storage.
// L'implementazione reale è MongoUserRepository; nei test viene usata FakeUserRepository.
import { User } from './User';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<void>;
}
