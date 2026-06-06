// fakes — Implementazioni fake (in-memory) delle porte di dominio per i test.
// FakeUserRepository e FakeSessionRepository usano una Map come storage volatile.
// FakePasswordHasher usa una trasformazione deterministica ('hashed:<plain>').
// FakeTokenSigner produce token leggibili senza crittografia reale.
// FakeClock restituisce un orario fisso iniettabile; FakeIdGenerator produce id sequenziali.
import { User } from '../../src/domain/entities/User';
import { Session } from '../../src/domain/entities/Session';
import { UserRepository } from '../../src/domain/ports/UserRepository';
import { SessionRepository } from '../../src/domain/ports/SessionRepository';
import { PasswordHasher } from '../../src/domain/ports/PasswordHasher';
import { TokenSigner, TokenPayload } from '../../src/domain/ports/TokenSigner';
import { Clock } from '../../src/domain/ports/Clock';
import { IdGenerator } from '../../src/domain/ports/IdGenerator';
import { UserRole } from '../../src/domain/entities/UserRole';

// ── Fake UserRepository ───────────────────────────────────────────────────────

export class FakeUserRepository implements UserRepository {
  private store: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.store.set(user.id, { ...user });
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const u of this.store.values()) {
      if (u.username === username) return { ...u };
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const u of this.store.values()) {
      if (u.email === email) return { ...u };
    }
    return null;
  }

  async update(user: User): Promise<void> {
    this.store.set(user.id, { ...user });
  }

  all(): User[] {
    return [...this.store.values()];
  }
}

// ── Fake SessionRepository ────────────────────────────────────────────────────

export class FakeSessionRepository implements SessionRepository {
  private store: Map<string, Session> = new Map();

  async save(session: Session): Promise<void> {
    this.store.set(session.id, { ...session });
  }

  async findById(id: string): Promise<Session | null> {
    return this.store.get(id) ?? null;
  }

  async findByTokenId(tokenId: string): Promise<Session | null> {
    for (const s of this.store.values()) {
      if (s.tokenId === tokenId) return { ...s };
    }
    return null;
  }

  async findAllByUserId(userId: string): Promise<Session[]> {
    return [...this.store.values()].filter((s) => s.userId === userId);
  }

  async update(session: Session): Promise<void> {
    this.store.set(session.id, { ...session });
  }

  all(): Session[] {
    return [...this.store.values()];
  }
}

// ── Fake PasswordHasher ───────────────────────────────────────────────────────

export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

// ── Fake TokenSigner ──────────────────────────────────────────────────────────

export class FakeTokenSigner implements TokenSigner {
  sign(payload: TokenPayload, _expiresIn: number): string {
    return `fake-token::${payload.userId}::${payload.tokenId}::${payload.role}`;
  }

  verify(token: string): TokenPayload {
    const parts = token.split('::');
    if (parts[0] !== 'fake-token' || parts.length !== 4) {
      throw new Error('INVALID_TOKEN');
    }
    return {
      userId: parts[1],
      tokenId: parts[2],
      role: parts[3] as UserRole,
    };
  }
}

// ── Fake Clock ────────────────────────────────────────────────────────────────

export class FakeClock implements Clock {
  constructor(private fixed: Date = new Date('2026-05-30T10:00:00Z')) {}

  now(): Date {
    return this.fixed;
  }
}

// ── Fake IdGenerator ──────────────────────────────────────────────────────────

export class FakeIdGenerator implements IdGenerator {
  private counter = 0;
  private prefix: string;

  constructor(prefix: string = 'id') {
    this.prefix = prefix;
  }

  generate(): string {
    this.counter++;
    return `${this.prefix}_${String(this.counter).padStart(3, '0')}`;
  }
}
