// RegisterUser — Use case: registrazione di un nuovo utente.
// Valida i dati in ingresso (username, email, password), verifica l'assenza di duplicati
// su username ed email, esegue il hash della password e persiste il nuovo utente con ruolo BASE.
import { UserRepository } from '../domain/UserRepository';
import { PasswordHasher } from '../domain/PasswordHasher';
import { Clock } from '../domain/Clock';
import { IdGenerator } from '../domain/IdGenerator';
import { UserRole } from '../domain/UserRole';
import {
  DuplicateUsernameError,
  DuplicateEmailError,
  ValidationError,
} from '../domain/errors';
import { RegisterUserInput, RegisterUserOutput } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export class RegisterUser {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly clock: Clock,
    private readonly idGen: IdGenerator,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    this.validate(input);

    const [existingByUsername, existingByEmail] = await Promise.all([
      this.userRepo.findByUsername(input.username),
      this.userRepo.findByEmail(input.email),
    ]);

    if (existingByUsername) throw new DuplicateUsernameError(input.username);
    if (existingByEmail) throw new DuplicateEmailError(input.email);

    const now = this.clock.now();
    const user = {
      id: this.idGen.generate(),
      username: input.username,
      email: input.email,
      passwordHash: await this.hasher.hash(input.password),
      role: UserRole.BASE,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.userRepo.save(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  private validate(input: RegisterUserInput): void {
    const errors: { field: string; reason: string }[] = [];

    if (!input.username || input.username.trim() === '') {
      errors.push({ field: 'username', reason: 'Username is required' });
    }

    if (!input.email || !EMAIL_RE.test(input.email)) {
      errors.push({ field: 'email', reason: 'Valid email is required' });
    }

    if (!input.password || input.password.length < MIN_PASSWORD_LENGTH) {
      errors.push({
        field: 'password',
        reason: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }
}
