import { Router, Request, Response, NextFunction } from 'express';
import { GetCart } from '../../useCases/GetCart';
import { UpsertCartItem } from '../../useCases/UpsertCartItem';
import { RemoveCartItem } from '../../useCases/RemoveCartItem';
import { ClearCart } from '../../useCases/ClearCart';

export interface CartRouterDeps {
  getCart: GetCart;
  upsertCartItem: UpsertCartItem;
  removeCartItem: RemoveCartItem;
  clearCart: ClearCart;
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

export function buildCartRouter(deps: CartRouterDeps): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get(
    '/',
    requireUserId,
    wrap(async (req, res) => {
      const userId = req.headers['x-user-id'] as string;
      const cart = await deps.getCart.execute({ userId });
      res.json(cart);
    }),
  );

  router.put(
    '/items/:sku',
    requireUserId,
    wrap(async (req, res) => {
      const userId = req.headers['x-user-id'] as string;
      const { sku } = req.params;
      const { name, unitPrice, quantity } = req.body as {
        name: string;
        unitPrice: number;
        quantity: number;
      };

      const cart = await deps.upsertCartItem.execute({
        userId,
        sku,
        name,
        unitPrice,
        quantity,
      });
      res.json(cart);
    }),
  );

  router.delete(
    '/items/:sku',
    requireUserId,
    wrap(async (req, res) => {
      const userId = req.headers['x-user-id'] as string;
      const cart = await deps.removeCartItem.execute({
        userId,
        sku: req.params['sku'],
      });
      res.json(cart);
    }),
  );

  router.delete(
    '/',
    requireUserId,
    wrap(async (req, res) => {
      const userId = req.headers['x-user-id'] as string;
      await deps.clearCart.execute({ userId });
      res.status(204).send();
    }),
  );

  return router;
}
