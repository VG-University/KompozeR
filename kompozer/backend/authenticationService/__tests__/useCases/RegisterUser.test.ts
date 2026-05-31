// RegisterUser.test — Test TDD per il use case RegisterUser.
// Verifica: registrazione corretta (ruolo BASE, password hashata), errori per username/email
// duplicati, errori di validazione (username vuoto, email invalida, password troppo corta)
// e unicità degli id assegnati.
import { RegisterUser } from '../../src/useCases/RegisterUser';
import {
  FakeUserRepository,
  FakePasswordHasher,
  FakeClock,
  FakeIdGenerator,
} from '../helpers/fakes';
import {
  DuplicateUsernameError,
  DuplicateEmailError,
  ValidationError,
} from '../../src/domain/errors';
import { UserRole } from '../../src/domain/UserRole';

function makeUseCase() {
  const userRepo = new FakeUserRepository();
  const hasher = new FakePasswordHasher();
  const clock = new FakeClock();
  const idGen = new FakeIdGenerator('usr');
  const useCase = new RegisterUser(userRepo, hasher, clock, idGen);
  return { useCase, userRepo, hasher };
}

describe('RegisterUser', () => {
  it('creates a new user with role BASE and hashed password', async () => {
    const { useCase, userRepo } = makeUseCase();

    const result = await useCase.execute({
      username: 'valerio',
      email: 'valerio@example.com',
      password: 'Password123!',
    });

    expect(result.user.username).toBe('valerio');
    expect(result.user.email).toBe('valerio@example.com');
    expect(result.user.role).toBe(UserRole.BASE);
    expect(result.user.id).toBeDefined();

    const saved = await userRepo.findByUsername('valerio');
    expect(saved).not.toBeNull();
    expect(saved!.passwordHash).toBe('hashed:Password123!');
    expect(saved!.passwordHash).not.toBe('Password123!');
  });

  it('throws DuplicateUsernameError when username is already taken', async () => {
    const { useCase } = makeUseCase();

    await useCase.execute({
      username: 'valerio',
      email: 'first@example.com',
      password: 'Password123!',
    });

    await expect(
      useCase.execute({
        username: 'valerio',
        email: 'second@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(DuplicateUsernameError);
  });

  it('throws DuplicateEmailError when email is already registered', async () => {
    const { useCase } = makeUseCase();

    await useCase.execute({
      username: 'first',
      email: 'shared@example.com',
      password: 'Password123!',
    });

    await expect(
      useCase.execute({
        username: 'second',
        email: 'shared@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(DuplicateEmailError);
  });

  it('throws ValidationError when username is empty', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ username: '', email: 'a@b.com', password: 'Password123!' }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when email is invalid', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ username: 'user', email: 'not-an-email', password: 'Password123!' }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when password is shorter than 8 characters', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ username: 'user', email: 'a@b.com', password: 'short' }),
    ).rejects.toThrow(ValidationError);
  });

  it('assigns a unique id to each user', async () => {
    const { useCase } = makeUseCase();

    const r1 = await useCase.execute({
      username: 'user1',
      email: 'u1@example.com',
      password: 'Password123!',
    });
    const r2 = await useCase.execute({
      username: 'user2',
      email: 'u2@example.com',
      password: 'Password123!',
    });

    expect(r1.user.id).not.toBe(r2.user.id);
  });
});
