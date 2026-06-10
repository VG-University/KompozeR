import { NextFunction, Request, Response, Router } from 'express';
import { isCategory } from '../../domain/entities/Category';
import { ValidationError } from '../../domain/entities/errors';
import { GetConfiguration } from '../../useCases/read/GetConfiguration';
import { CreateConfiguration } from '../../useCases/write/CreateConfiguration';

export interface CadRouterDeps {
  createConfiguration: CreateConfiguration;
  getConfiguration: GetConfiguration;
}

function wrap(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function requireUserId(req: Request, res: Response, next: NextFunction): void {
  const ownerId = req.headers['x-user-id'];
  if (!ownerId || typeof ownerId !== 'string') {
    res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Missing identity header X-User-Id',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
}

function parseCategory(body: unknown): 'TONDO' | 'QUADRO' | 'KUBE' | null | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const typedBody = body as {
    category?: unknown;
    systemType?: unknown;
  };

  if (typedBody.category !== undefined) {
    if (typedBody.category === null) {
      return null;
    }
    if (!isCategory(typedBody.category)) {
      throw new ValidationError('category must be one of TONDO, QUADRO, KUBE');
    }
    return typedBody.category;
  }

  if (typedBody.systemType !== undefined) {
    if (typedBody.systemType === null) {
      return null;
    }
    if (!isCategory(typedBody.systemType)) {
      throw new ValidationError('systemType must be one of TONDO, QUADRO, KUBE');
    }
    return typedBody.systemType;
  }

  return undefined;
}

export function buildCadRouter(deps: CadRouterDeps): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.post(
    '/configurations',
    requireUserId,
    wrap(async (req, res) => {
      const ownerId = req.headers['x-user-id'] as string;
      const body = (req.body ?? {}) as { name?: unknown };

      const category = parseCategory(req.body);
      const name = typeof body.name === 'string' ? body.name : undefined;

      const configuration = await deps.createConfiguration.execute({
        ownerId,
        name,
        category,
      });

      res.status(201).json(configuration);
    }),
  );

  router.get(
    '/configurations/:id',
    requireUserId,
    wrap(async (req, res) => {
      const ownerId = req.headers['x-user-id'] as string;
      const configuration = await deps.getConfiguration.execute({
        id: req.params['id'],
        ownerId,
      });
      res.json(configuration);
    }),
  );

  return router;
}
