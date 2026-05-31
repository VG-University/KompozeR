// types — Tipi input/output per tutti gli use case dell'authenticationService.
// Raccoglie in un unico file le interfacce delle richieste e delle risposte
// così da avere un contratto leggibile separato dalla logica applicativa.
import { UserRole } from '../domain/UserRole';

// ── RegisterUser ─────────────────────────────────────────────────────────────

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

// ── LoginUser ─────────────────────────────────────────────────────────────────

export interface LoginUserInput {
  username: string;
  password: string;
}

export interface LoginUserOutput {
  token: string;
  session: {
    id: string;
    tokenId: string;
    loggedIn: Date;
    expiresAt: Date;
  };
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}

// ── GenerateGuestSession ──────────────────────────────────────────────────────

export interface GenerateGuestSessionOutput {
  token: string;
  session: {
    id: string;
    tokenId: string;
    loggedIn: Date;
    expiresAt: Date;
  };
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}

// ── GetCurrentUser ────────────────────────────────────────────────────────────

export interface GetCurrentUserInput {
  userId: string;
}

export interface GetCurrentUserOutput {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

// ── LogoutUser ────────────────────────────────────────────────────────────────

export interface LogoutUserInput {
  userId: string;
  sessionId: string;
}

// ── ListUserSessions ──────────────────────────────────────────────────────────

export interface ListUserSessionsInput {
  userId: string;
}

export interface SessionSummary {
  id: string;
  tokenId: string;
  loggedIn: Date;
  expiresAt: Date;
  loggedOut: Date | null;
  isRevoked: boolean;
}

export interface ListUserSessionsOutput {
  sessions: SessionSummary[];
}

// ── RevokeSession ─────────────────────────────────────────────────────────────

export interface RevokeSessionInput {
  requestingUserId: string;
  sessionId: string;
}
