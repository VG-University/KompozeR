// PasswordHasher — Porta di dominio per l'hashing e la verifica delle password.
// Astrae l'algoritmo di hashing (bcrypt in produzione, stub deterministico nei test)
// in modo che i use case non dipendano da nessuna libreria concreta.
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
