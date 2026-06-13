import express from 'express';
import cors from 'cors';
import { MongoCartRepository } from './adapters/persistence/MongoCartRepository';
import { HttpCatalogSnapshotProvider } from './adapters/httpClient/HttpCatalogSnapshotProvider';
import { GetCart } from './useCases/GetCart';
import { UpsertCartItem } from './useCases/UpsertCartItem';
import { RemoveCartItem } from './useCases/RemoveCartItem';
import { ClearCart } from './useCases/ClearCart';
import { CheckoutCart } from './useCases/CheckoutCart';
import { buildCartRouter } from './adapters/http/cartRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';

export interface CartAppConfig {
  catalogBaseUrl?: string;
}

export function buildApp(config: CartAppConfig = {}) {
  const repo = new MongoCartRepository();
  const catalog = new HttpCatalogSnapshotProvider(config.catalogBaseUrl || 'http://catalog-service:3002');

  const getCart = new GetCart(repo);
  const upsertCartItem = new UpsertCartItem(repo);
  const removeCartItem = new RemoveCartItem(repo);
  const clearCart = new ClearCart(repo);
  const checkoutCart = new CheckoutCart(repo, catalog);

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
      checkoutCart,
    }),
  );

  app.use(errorMiddleware);

  return app;
}
