/**
 * orderService composition root.
 * Wires concrete repository and use cases, mounts HTTP routes,
 * and configures middleware.
 */
import cors from 'cors';
import express from 'express';
import { buildOrderRouter } from './adapters/http/orderRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';
import { MongoOrderRepository } from './adapters/persistence/MongoOrderRepository';
import { CancelOrder } from './useCases/CancelOrder';
import { CreateOrder } from './useCases/CreateOrder';
import { GetOrder } from './useCases/GetOrder';
import { ListOrders } from './useCases/ListOrders';
import { UpdateOrderStatus } from './useCases/UpdateOrderStatus';

export function buildApp() {
  const repo = new MongoOrderRepository();

  const createOrder = new CreateOrder(repo);
  const listOrders = new ListOrders(repo);
  const getOrder = new GetOrder(repo);
  const cancelOrder = new CancelOrder(repo);
  const updateOrderStatus = new UpdateOrderStatus(repo);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(
    '/orders',
    buildOrderRouter({
      createOrder,
      listOrders,
      getOrder,
      cancelOrder,
      updateOrderStatus,
    }),
  );

  app.use(errorMiddleware);

  return app;
}
