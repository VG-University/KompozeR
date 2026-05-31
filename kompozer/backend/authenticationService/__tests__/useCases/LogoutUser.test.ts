// LogoutUser.test — Test TDD per il use case LogoutUser.
// Verifica: logout corretto (loggedOut impostato), SessionNotFoundError per sessione inesistente,
// ForbiddenError quando un utente cerca di chiudere la sessione di un altro utente.
import { LogoutUser } from '../../src/useCases/LogoutUser';
import { LoginUser } from '../../src/useCases/LoginUser';
import { RegisterUser } from '../../src/useCases/RegisterUser';
import {
  FakeUserRepository,
  FakeSessionRepository,
  FakePasswordHasher,
  FakeTokenSigner,
  FakeClock,
  FakeIdGenerator,
} from '../helpers/fakes';
import { SessionNotFoundError, ForbiddenError } from '../../src/domain/errors';

function makeUseCases() {
  const userRepo = new FakeUserRepository();
  const sessionRepo = new FakeSessionRepository();
  const hasher = new FakePasswordHasher();
  const signer = new FakeTokenSigner();
  const clock = new FakeClock();
  const userIdGen = new FakeIdGenerator('usr');
  const sessionIdGen = new FakeIdGenerator('ses');
  const tokenIdGen = new FakeIdGenerator('tok');

  const register = new RegisterUser(userRepo, hasher, clock, userIdGen);
  const login = new LoginUser(
    userRepo,
    sessionRepo,
    hasher,
    signer,
    clock,
    sessionIdGen,
    tokenIdGen,
    8 * 60 * 60 * 1000,
  );
  const logout = new LogoutUser(sessionRepo, clock);

  return { register, login, logout, sessionRepo };
}

describe('LogoutUser', () => {
  it('marks the session as logged out', async () => {
    const { register, login, logout, sessionRepo } = makeUseCases();

    await register.execute({
      username: 'valerio',
      email: 'v@example.com',
      password: 'Password123!',
    });
    const loginResult = await login.execute({ username: 'valerio', password: 'Password123!' });

    await logout.execute({
      userId: loginResult.user.id,
      sessionId: loginResult.session.id,
    });

    const session = await sessionRepo.findById(loginResult.session.id);
    expect(session!.loggedOut).not.toBeNull();
  });

  it('throws SessionNotFoundError when session does not exist', async () => {
    const { register, login, logout } = makeUseCases();

    await register.execute({
      username: 'valerio',
      email: 'v@example.com',
      password: 'Password123!',
    });
    const loginResult = await login.execute({ username: 'valerio', password: 'Password123!' });

    await expect(
      logout.execute({ userId: loginResult.user.id, sessionId: 'non-existent' }),
    ).rejects.toThrow(SessionNotFoundError);
  });

  it('throws ForbiddenError when userId does not match session owner', async () => {
    const { register, login, logout } = makeUseCases();

    await register.execute({ username: 'alice', email: 'alice@e.com', password: 'Password123!' });
    await register.execute({ username: 'bob', email: 'bob@e.com', password: 'Password123!' });

    const aliceLogin = await login.execute({ username: 'alice', password: 'Password123!' });
    const bobLogin = await login.execute({ username: 'bob', password: 'Password123!' });

    await expect(
      logout.execute({ userId: bobLogin.user.id, sessionId: aliceLogin.session.id }),
    ).rejects.toThrow(ForbiddenError);
  });
});
