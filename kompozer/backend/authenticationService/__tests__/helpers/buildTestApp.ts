/**
 * Factory that builds the Express app with fake dependencies for HTTP tests.
 *
 * Instantiates all use cases by injecting fakes instead of production adapters,
 * allowing HTTP adapter tests to run without MongoDB or real JWT signing.
 */
import express from 'express';
import { RegisterUser } from '../../src/useCases/RegisterUser';
import { LoginUser } from '../../src/useCases/LoginUser';
import { GenerateGuestSession } from '../../src/useCases/GenerateGuestSession';
import { LogoutUser } from '../../src/useCases/LogoutUser';
import { GetCurrentUser } from '../../src/useCases/GetCurrentUser';
import { ListUserSessions } from '../../src/useCases/ListUserSessions';
import { RevokeSession } from '../../src/useCases/RevokeSession';
import {
  FakeUserRepository,
  FakeSessionRepository,
  FakePasswordHasher,
  FakeTokenSigner,
  FakeClock,
  FakeIdGenerator,
} from './fakes';
import { buildAuthRouter } from '../../src/adapters/http/authRouter';
import { errorMiddleware } from '../../src/adapters/http/errorMiddleware';

export function buildTestApp() {
  const userRepo = new FakeUserRepository();
  const sessionRepo = new FakeSessionRepository();
  const hasher = new FakePasswordHasher();
  const signer = new FakeTokenSigner();
  const clock = new FakeClock();
  const userIdGen = new FakeIdGenerator('usr');
  const sessionIdGen = new FakeIdGenerator('ses');
  const tokenIdGen = new FakeIdGenerator('tok');
  const guestIdGen = new FakeIdGenerator('gst');
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

  const registerUser = new RegisterUser(userRepo, hasher, clock, userIdGen);
  const loginUser = new LoginUser(
    userRepo,
    sessionRepo,
    hasher,
    signer,
    clock,
    sessionIdGen,
    tokenIdGen,
    SESSION_TTL_MS,
  );
  const generateGuestSession = new GenerateGuestSession(
    sessionRepo,
    signer,
    clock,
    guestIdGen,
    sessionIdGen,
    tokenIdGen,
    SESSION_TTL_MS,
  );
  const logoutUser = new LogoutUser(sessionRepo, clock);
  const getCurrentUser = new GetCurrentUser(userRepo, sessionRepo, clock);
  const listUserSessions = new ListUserSessions(sessionRepo);
  const revokeSession = new RevokeSession(sessionRepo, userRepo);

  const app = express();
  app.use(express.json());
  app.use(
    '/auth',
    buildAuthRouter({
      registerUser,
      loginUser,
      generateGuestSession,
      logoutUser,
      getCurrentUser,
      listUserSessions,
      revokeSession,
    }),
  );
  app.use(errorMiddleware);

  return app;
}
