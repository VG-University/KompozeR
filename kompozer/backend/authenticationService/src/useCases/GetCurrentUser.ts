// GetCurrentUser — Use case: recupero del profilo dell'utente autenticato.
// Riceve l'userId iniettato dall'API gateway tramite header X-User-Id
// e restituisce il profilo completo (senza passwordHash).
import { UserRepository } from '../domain/UserRepository';
import { UserNotFoundError } from '../domain/errors';
import { GetCurrentUserInput, GetCurrentUserOutput } from './types';

export class GetCurrentUser {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: GetCurrentUserInput): Promise<GetCurrentUserOutput> {
    const user = await this.userRepo.findById(input.userId);

    if (!user) throw new UserNotFoundError();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
