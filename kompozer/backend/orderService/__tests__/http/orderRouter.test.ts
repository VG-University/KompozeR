import express from 'express';
import request from 'supertest';
import { buildOrderRouter } from '../../src/adapters/http/orderRouter';
import { errorMiddleware } from '../../src/adapters/http/errorMiddleware';
import { CancelOrder } from '../../src/useCases/CancelOrder';
import { CreateOrder } from '../../src/useCases/CreateOrder';
import { GetOrder } from '../../src/useCases/GetOrder';
import { ListOrders } from '../../src/useCases/ListOrders';
import { FakeOrderRepository } from '../helpers/fakes';

function buildTestApp() {
  const repo = new FakeOrderRepository();

  const app = express();
  app.use(express.json());
  app.use(
    '/orders',
    buildOrderRouter({
      createOrder: new CreateOrder(repo),
      listOrders: new ListOrders(repo),
      getOrder: new GetOrder(repo),
      cancelOrder: new CancelOrder(repo),
    }),
  );
  app.use(errorMiddleware);

  return app;
}

describe('orderRouter', () => {
  it('POST /orders -> 401 when identity header is missing', async () => {
    const app = buildTestApp();
    const res = await request(app).post('/orders').send({});
    expect(res.status).toBe(401);
  });

  it('order lifecycle works for owner', async () => {
    const app = buildTestApp();

    const createRes = await request(app)
      .post('/orders')
      .set('x-user-id', 'usr_1')
      .send({
        items: [
          {
            sku: 'SKU-001',
            name: 'Ripiano',
            unitPrice: 1990,
            quantity: 2,
          },
        ],
        total: 3980,
      });

    expect(createRes.status).toBe(201);
    const orderId = createRes.body.id as string;

    const listRes = await request(app).get('/orders').set('x-user-id', 'usr_1');
    expect(listRes.status).toBe(200);
    expect(listRes.body.items).toHaveLength(1);

    const getRes = await request(app).get(`/orders/${orderId}`).set('x-user-id', 'usr_1');
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(orderId);

    const cancelRes = await request(app)
      .patch(`/orders/${orderId}/cancel`)
      .set('x-user-id', 'usr_1')
      .send({});

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('CANCELLED');
  });
});
