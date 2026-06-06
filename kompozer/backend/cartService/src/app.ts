import express from 'express';
import cors from 'cors';
import { MongoCartRepository } from './adapters/persistence/MongoCartRepository';
import { GetCart } from './useCases/GetCart';
import { UpsertCartItem } from './useCases/UpsertCartItem';
import { RemoveCartItem } from './useCases/RemoveCartItem';
import { ClearCart } from './useCases/ClearCart';
import { buildCartRouter } from './adapters/http/cartRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';

export function buildApp() {
  const repo = new MongoCartRepository();

  const getCart = new GetCart(repo);
  const upsertCartItem = new UpsertCartItem(repo);
  const removeCartItem = new RemoveCartItem(repo);
  const clearCart = new ClearCart(repo);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(
    '/cart',
    buildCartRouter({
      getCart,
      upsertCartItem,
      removeCartItem,
      clearCart,
    }),
  );

  app.use(errorMiddleware);

  return app;
}
