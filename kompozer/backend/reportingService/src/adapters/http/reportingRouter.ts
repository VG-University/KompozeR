import { NextFunction, Request, Response, Router } from 'express';
import { GetOrderTrend } from '../../useCases/GetOrderTrend';

export interface ReportingRouterDeps {
  getOrderTrend: GetOrderTrend;
}

function wrap(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function requireUserId(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'];
  if (!userId || typeof userId !== 'string') {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing identity header X-User-Id',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const role = req.headers['x-user-role'];
  if (typeof role !== 'string' || role.toUpperCase() !== 'ADMIN') {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Admin role required',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
  next();
}

export function buildReportingRouter(deps: ReportingRouterDeps): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get(
    '/trends/orders',
    requireUserId,
    requireAdmin,
    wrap(async (req, res) => {
      const from = typeof req.query['from'] === 'string' ? req.query['from'] : undefined;
      const to = typeof req.query['to'] === 'string' ? req.query['to'] : undefined;

      const trend = await deps.getOrderTrend.execute({ from, to });
      res.json(trend);
    }),
  );

  return router;
}
