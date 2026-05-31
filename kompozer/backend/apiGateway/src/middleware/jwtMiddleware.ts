// jwtMiddleware — Middleware che verifica il JWT e inietta gli header di identità.
//
// Strategia (concordata nel progetto):
//   1. Il gateway è l'UNICO componente che verifica la firma JWT.
//   2. Dopo la verifica inietta tre header nel request forward:
//      X-User-Id, X-User-Role, X-Session-Id.
//   3. Tutti gli altri microservizi si fidano SOLO di quei header, mai del JWT raw.
//
// Le route pubbliche (es. POST /auth/register, POST /auth/login, POST /auth/guest)
// devono essere escluse da questo middleware tramite `publicRoutes`.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MissingTokenError, InvalidTokenError } from '../errors';

interface JwtPayload {
  userId: string;
  tokenId: string;
  role: string;
}

const PUBLIC_ROUTES: Array<{ method: string; path: RegExp }> = [
  { method: 'POST', path: /^\/auth\/register$/ },
  { method: 'POST', path: /^\/auth\/login$/ },
  { method: 'POST', path: /^\/auth\/guest$/ },
];

function isPublic(req: Request): boolean {
  return PUBLIC_ROUTES.some(
    (r) => r.method === req.method && r.path.test(req.path),
  );
}

export function buildJwtMiddleware(jwtSecret: string) {
  return function jwtMiddleware(req: Request, _res: Response, next: NextFunction): void {
    // Strip identity headers from every incoming request — including public routes.
    // Prevents clients from spoofing X-User-Id / X-User-Role / X-Session-Id
    // on routes that skip JWT verification (OWASP A01 — Broken Access Control).
    delete req.headers['x-user-id'];
    delete req.headers['x-user-role'];
    delete req.headers['x-session-id'];

    if (isPublic(req)) {
      return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new MissingTokenError());
    }

    const token = authHeader.slice(7);

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch {
      return next(new InvalidTokenError());
    }

    // Injecting identity headers — downstream services read ONLY these
    req.headers['x-user-id'] = payload.userId;
    req.headers['x-user-role'] = payload.role;
    req.headers['x-session-id'] = payload.tokenId;

    next();
  };
}
