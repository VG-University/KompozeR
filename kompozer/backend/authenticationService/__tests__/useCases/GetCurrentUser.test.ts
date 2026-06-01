// GetCurrentUser.test — Test TDD per il use case GetCurrentUser.
// Verifica: restituzione corretta del profilo per un utente registrato
// e UserNotFoundError per un userId inesistente.
import { GetCurrentUser } from '../../src/useCases/GetCurrentUser';
import { RegisterUser } from '../../src/useCases/RegisterUser';
import {
  FakeUserRepository,
  FakePasswordHasher,
  FakeClock,
  FakeIdGenerator,
} from '../helpers/fakes';
import { UserNotFoundError } from '../../src/domain/entities/errors';
import { UserRole } from '../../src/domain/entities/UserRole';

function makeUseCases() {
  const userRepo = new FakeUserRepository();
  const hasher = new FakePasswordHasher();
  const clock = new FakeClock();
  const userIdGen = new FakeIdGenerator('usr');

  const register = new RegisterUser(userRepo, hasher, clock, userIdGen);
  const getMe = new GetCurrentUser(userRepo);

  return { register, getMe };
}

describe('GetCurrentUser', () => {
  it('returns user profile for a registered user', async () => {
    const { register, getMe } = makeUseCases();

    const { user } = await register.execute({
      username: 'alice',
      email: 'alice@e.com',
      password: 'Password123!',
    });

    const profile = await getMe.execute({ userId: user.id });

    expect(profile.username).toBe('alice');
    expect(profile.email).toBe('alice@e.com');
    expect(profile.role).toBe(UserRole.BASE);
    expect(profile.id).toBe(user.id);
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    const { getMe } = makeUseCases();

    await expect(getMe.execute({ userId: 'non-existent' })).rejects.toThrow(UserNotFoundError);
  });
});
