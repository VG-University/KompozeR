// app — Composition root dell'authenticationService.
// Istanzia le dipendenze concrete (repository Mongo, hasher bcrypt, signer JWT, clock, idGen),
// crea tutti i use case con dependency injection e assembla l'app Express con CORS, routing
// e error middleware. Esportato come factory per facilitare i test di integrazione.
import express from 'express';
import cors from 'cors';
import { RegisterUser } from './useCases/RegisterUser';
import { LoginUser } from './useCases/LoginUser';
import { GenerateGuestSession } from './useCases/GenerateGuestSession';
import { LogoutUser } from './useCases/LogoutUser';
import { GetCurrentUser } from './useCases/GetCurrentUser';
import { ListUserSessions } from './useCases/ListUserSessions';
import { RevokeSession } from './useCases/RevokeSession';
import { MongoUserRepository } from './adapters/persistence/MongoUserRepository';
import { MongoSessionRepository } from './adapters/persistence/MongoSessionRepository';
import { BcryptPasswordHasher } from './infrastructure/BcryptPasswordHasher';
import { JwtTokenSigner } from './infrastructure/JwtTokenSigner';
import { SystemClock } from './infrastructure/SystemClock';
import { UuidIdGenerator } from './infrastructure/UuidIdGenerator';
import { buildAuthRouter } from './adapters/http/authRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';

export interface AppConfig {
  jwtSecret: string;
  sessionTtlMs: number;
}

export function buildApp(config: AppConfig) {
  const userRepo = new MongoUserRepository();
  const sessionRepo = new MongoSessionRepository();
  const hasher = new BcryptPasswordHasher();
  const signer = new JwtTokenSigner(config.jwtSecret);
  const clock = new SystemClock();
  const userIdGen = new UuidIdGenerator();
  const sessionIdGen = new UuidIdGenerator();
  const tokenIdGen = new UuidIdGenerator();
  const guestIdGen = new UuidIdGenerator();

  const registerUser = new RegisterUser(userRepo, hasher, clock, userIdGen);
  const loginUser = new LoginUser(
    userRepo,
    sessionRepo,
    hasher,
    signer,
    clock,
    sessionIdGen,
    tokenIdGen,
    config.sessionTtlMs,
  );
  const generateGuestSession = new GenerateGuestSession(
    sessionRepo,
    signer,
    clock,
    guestIdGen,
    sessionIdGen,
    tokenIdGen,
    config.sessionTtlMs,
  );
  const logoutUser = new LogoutUser(sessionRepo, clock);
  const getCurrentUser = new GetCurrentUser(userRepo);
  const listUserSessions = new ListUserSessions(sessionRepo);
  const revokeSession = new RevokeSession(sessionRepo, userRepo);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

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
