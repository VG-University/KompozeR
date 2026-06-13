import express from 'express';
import cors from 'cors';
import { Server as HttpServer } from 'http';
import { MongoNotificationRepository } from './adapters/persistence/MongoNotificationRepository';
import { MongoProcessedEventRepository } from './adapters/persistence/MongoProcessedEventRepository';
import { MongoImpactResolver } from './adapters/persistence/MongoImpactResolver';
import { NotificationSocketHub } from './adapters/websocket/NotificationSocketHub';
import { HandleCatalogEvent } from './useCases/HandleCatalogEvent';
import { UuidIdGenerator } from './infrastructure/UuidIdGenerator';
import { RedisCatalogEventsSubscriber } from './adapters/messaging/subscribers/RedisCatalogEventsSubscriber';
import { ListNotifications } from './useCases/ListNotifications';
import { CountUnreadNotifications } from './useCases/CountUnreadNotifications';
import { MarkNotificationRead } from './useCases/MarkNotificationRead';
import { CreateSubscription } from './useCases/CreateSubscription';
import { ListSubscriptions } from './useCases/ListSubscriptions';
import { GetSubscription } from './useCases/GetSubscription';
import { UpdateSubscription } from './useCases/UpdateSubscription';
import { DeleteSubscription } from './useCases/DeleteSubscription';
import { buildNotificationsRouter } from './adapters/http/notificationsRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';

export interface NotificationAppConfig {
  redisUrl?: string;
  cartMongoUri?: string;
  cadMongoUri?: string;
}

export interface NotificationRuntime {
  app: express.Express;
  attachRealtime: (server: HttpServer) => Promise<void>;
  shutdown: () => Promise<void>;
}

export function buildApp(config: NotificationAppConfig = {}): NotificationRuntime {
  const notifications = new MongoNotificationRepository();
  const processedEvents = new MongoProcessedEventRepository();
  const impactResolver = new MongoImpactResolver(notifications, {
    cartMongoUri: config.cartMongoUri,
    cadMongoUri: config.cadMongoUri,
  });

  const idGenerator = new UuidIdGenerator();

  let socketHub: NotificationSocketHub | null = null;

  const fallbackBroadcaster = {
    push: async (_notification: unknown) => {
      return;
    },
  };

  const eventHandler = new HandleCatalogEvent(
    notifications,
    processedEvents,
    impactResolver,
    {
      push: async (notification) => {
        if (socketHub) {
          await socketHub.push(notification);
          return;
        }
        await fallbackBroadcaster.push(notification);
      },
    },
    idGenerator,
  );

  const listNotifications = new ListNotifications(notifications);
  const countUnreadNotifications = new CountUnreadNotifications(notifications);
  const markNotificationRead = new MarkNotificationRead(notifications);
  const createSubscription = new CreateSubscription(notifications);
  const listSubscriptions = new ListSubscriptions(notifications);
  const getSubscription = new GetSubscription(notifications);
  const updateSubscription = new UpdateSubscription(notifications);
  const deleteSubscription = new DeleteSubscription(notifications);

  const redisSubscriber = config.redisUrl
    ? new RedisCatalogEventsSubscriber(config.redisUrl, eventHandler)
    : null;

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(
    '/notifications',
    buildNotificationsRouter({
      listNotifications,
      countUnreadNotifications,
      markNotificationRead,
      createSubscription,
      listSubscriptions,
      getSubscription,
      updateSubscription,
      deleteSubscription,
    }),
  );

  app.use(errorMiddleware);

  return {
    app,
    attachRealtime: async (server: HttpServer) => {
      socketHub = new NotificationSocketHub(server);
      if (redisSubscriber) {
        await redisSubscriber.start();
      } else {
        console.log('[notification] Redis disabled: catalog events subscriber not started');
      }
    },
    shutdown: async () => {
      await Promise.allSettled([
        redisSubscriber?.stop(),
        impactResolver.close(),
      ]);
    },
  };
}
