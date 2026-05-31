// jwtMiddleware.test — Test TDD per il middleware JWT del gateway.
// Verifica che le route pubbliche passino senza token, che le route protette
// richiedano un Bearer token valido, che vengano iniettati i tre header corretti
// e che token malformati o scaduti producano 401.
import request from 'supertest';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { buildJwtMiddleware } from '../../src/middleware/jwtMiddleware';
import { gatewayErrorMiddleware } from '../../src/middleware/gatewayErrorMiddleware';

const SECRET = 'test-secret';

function buildApp() {
  const app = express();
  app.use(buildJwtMiddleware(SECRET));

  // Endpoint di eco: restituisce gli header ricevuti per verificare l'iniezione
  app.get('/protected', (req: Request, res: Response) => {
    res.json({
      userId: req.headers['x-user-id'],
      role: req.headers['x-user-role'],
      sessionId: req.headers['x-session-id'],
    });
  });

  app.post('/auth/register', (_req: Request, res: Response) => res.status(201).json({}));
  app.post('/auth/login', (_req: Request, res: Response) => res.json({}));
  app.post('/auth/guest', (_req: Request, res: Response) => res.json({}));

  app.use(gatewayErrorMiddleware);
  return app;
}

function makeToken(payload: object, secret = SECRET, options?: jwt.SignOptions) {
  return jwt.sign(payload, secret, { expiresIn: 3600, ...options });
}

const app = buildApp();

describe('jwtMiddleware — route pubbliche', () => {
  it('POST /auth/register passa senza Authorization header', async () => {
    const res = await request(app).post('/auth/register');
    expect(res.status).toBe(201);
  });

  it('POST /auth/login passa senza Authorization header', async () => {
    const res = await request(app).post('/auth/login');
    expect(res.status).toBe(200);
  });

  it('POST /auth/guest passa senza Authorization header', async () => {
    const res = await request(app).post('/auth/guest');
    expect(res.status).toBe(200);
  });
});

describe('jwtMiddleware — route protette', () => {
  it('restituisce 401 se Authorization header è assente', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MISSING_TOKEN');
  });

  it('restituisce 401 se il formato non è Bearer', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MISSING_TOKEN');
  });

  it('restituisce 401 se il token è malformato', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer not.a.valid.token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('restituisce 401 se il token è firmato con secret sbagliato', async () => {
    const token = makeToken({ userId: 'u1', tokenId: 'tok1', role: 'BASE' }, 'wrong-secret');
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('restituisce 401 se il token è scaduto', async () => {
    const token = makeToken(
      { userId: 'u1', tokenId: 'tok1', role: 'BASE' },
      SECRET,
      { expiresIn: -1 },
    );
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('inietta X-User-Id, X-User-Role e X-Session-Id per token valido', async () => {
    const token = makeToken({ userId: 'usr-42', tokenId: 'tok-99', role: 'BASE' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('usr-42');
    expect(res.body.role).toBe('BASE');
    expect(res.body.sessionId).toBe('tok-99');
  });

  it('inietta correttamente il ruolo ADMIN', async () => {
    const token = makeToken({ userId: 'admin-1', tokenId: 'tok-admin', role: 'ADMIN' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMIN');
  });

  it('inietta correttamente il ruolo GUEST', async () => {
    const token = makeToken({ userId: 'gst-1', tokenId: 'tok-gst', role: 'GUEST' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('GUEST');
  });
});

describe('jwtMiddleware — strip header in ingresso (OWASP A01)', () => {
  // Un client non autenticato non deve poter iniettare x-user-id su route pubbliche
  // e far credere al downstream di essere un utente autenticato.
  it('strip di X-User-Id forged su route pubblica', async () => {
    // Costruiamo un'app separata con un handler pubblico che riflette gli header
    const echoApp = express();
    echoApp.use(buildJwtMiddleware(SECRET));
    echoApp.post('/auth/login', (req: Request, res: Response) => {
      res.json({
        userId: req.headers['x-user-id'] ?? null,
        role: req.headers['x-user-role'] ?? null,
        sessionId: req.headers['x-session-id'] ?? null,
      });
    });
    echoApp.use(gatewayErrorMiddleware);

    const res = await request(echoApp)
      .post('/auth/login')
      .set('X-User-Id', 'spoofed-admin')
      .set('X-User-Role', 'ADMIN')
      .set('X-Session-Id', 'spoofed-session');

    expect(res.status).toBe(200);
    // Il middleware deve aver rimosso tutti e tre gli header prima di passare al downstream
    expect(res.body.userId).toBeNull();
    expect(res.body.role).toBeNull();
    expect(res.body.sessionId).toBeNull();
  });

  it('strip di X-User-Id forged su route protetta (anche se il token è valido)', async () => {
    const token = makeToken({ userId: 'real-user', tokenId: 'real-tok', role: 'BASE' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .set('X-User-Id', 'spoofed-admin')
      .set('X-User-Role', 'ADMIN');

    expect(res.status).toBe(200);
    // Il valore deve venire SOLO dal payload JWT, non dall'header in ingresso
    expect(res.body.userId).toBe('real-user');
    expect(res.body.role).toBe('BASE');
  });
});
