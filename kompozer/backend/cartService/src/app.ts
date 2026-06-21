import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import { MongoCartRepository } from './adapters/persistence/MongoCartRepository';
import { HttpCatalogSnapshotProvider } from './adapters/httpClient/HttpCatalogSnapshotProvider';
import { HttpOrderServiceClient } from './adapters/httpClient/HttpOrderServiceClient';
import { RedisCartEventPublisher } from './adapters/messaging/publishers/RedisCartEventPublisher';
import { RedisCatalogEventsSubscriber } from './adapters/messaging/subscribers/RedisCatalogEventsSubscriber';
import { GetCart } from './useCases/GetCart';
import { UpsertCartItem } from './useCases/UpsertCartItem';
import { RemoveCartItem } from './useCases/RemoveCartItem';
import { ClearCart } from './useCases/ClearCart';
import { CheckoutCart } from './useCases/CheckoutCart';
import { RestoreUnavailableItems } from './useCases/RestoreUnavailableItems';
import { buildCartRouter } from './adapters/http/cartRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';
import { CartEventPublisher } from './domain/ports/CartEventPublisher';
import { NoopCartEventPublisher } from './infrastructure/NoopCartEventPublisher';

export interface CartAppConfig {
  catalogBaseUrl?: string;
  orderBaseUrl?: string;
  redisUrl?: string;
}

export function buildApp(config: CartAppConfig = {}) {
  const repo = new MongoCartRepository();
  const catalog = new HttpCatalogSnapshotProvider(config.catalogBaseUrl || 'http://catalog-service:3002');
  const order = new HttpOrderServiceClient(config.orderBaseUrl || 'http://order-service:3008');
  let eventPublisher: CartEventPublisher = new NoopCartEventPublisher();

  if (config.redisUrl) {
    const redis = new Redis(config.redisUrl);
    eventPublisher = new RedisCartEventPublisher(redis);

    const restoreUnavailableItems = new RestoreUnavailableItems(repo, catalog, eventPublisher);
    const catalogSubscriber = new RedisCatalogEventsSubscriber(config.redisUrl, restoreUnavailableItems);
    void catalogSubscriber.start().catch((error) => {
      console.error('[cart] Failed to start catalog events subscriber', error);
    });
  }

  const getCart = new GetCart(repo, catalog, eventPublisher);
  const upsertCartItem = new UpsertCartItem(repo, eventPublisher);
  const removeCartItem = new RemoveCartItem(repo, eventPublisher);
  const clearCart = new ClearCart(repo, eventPublisher);
  const checkoutCart = new CheckoutCart(repo, catalog, order, eventPublisher);

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
