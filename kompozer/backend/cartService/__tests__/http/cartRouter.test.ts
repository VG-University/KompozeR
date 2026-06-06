import express from 'express';
import request from 'supertest';
import { buildCartRouter } from '../../src/adapters/http/cartRouter';
import { errorMiddleware } from '../../src/adapters/http/errorMiddleware';
import { GetCart } from '../../src/useCases/GetCart';
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import { RemoveCartItem } from '../../src/useCases/RemoveCartItem';
import { ClearCart } from '../../src/useCases/ClearCart';
import { FakeCartRepository } from '../helpers/fakes';

function buildTestApp() {
  const repo = new FakeCartRepository();

  const app = express();
  app.use(express.json());
  app.use(
    '/cart',
    buildCartRouter({
      getCart: new GetCart(repo),
      upsertCartItem: new UpsertCartItem(repo),
      removeCartItem: new RemoveCartItem(repo),
      clearCart: new ClearCart(repo),
    }),
  );
  app.use(errorMiddleware);

  return app;
}

describe('cartRouter', () => {
  it('GET /cart -> 401 when identity is missing', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/cart');
    expect(res.status).toBe(401);
  });

  it('PUT /cart/items/:sku adds item and GET /cart returns it', async () => {
    const app = buildTestApp();

    const upsert = await request(app)
      .put('/cart/items/SKU-001')
      .set('x-user-id', 'usr_1')
      .send({ name: 'Ripiano', unitPrice: 1990, quantity: 2 });

    expect(upsert.status).toBe(200);
    expect(upsert.body.total).toBe(3980);

    const get = await request(app).get('/cart').set('x-user-id', 'usr_1');
    expect(get.status).toBe(200);
    expect(get.body.items).toHaveLength(1);
  });

  it('DELETE /cart/items/:sku removes item', async () => {
    const app = buildTestApp();

    await request(app)
      .put('/cart/items/SKU-001')
      .set('x-user-id', 'usr_1')
      .send({ name: 'Ripiano', unitPrice: 1990, quantity: 2 });

    const del = await request(app)
      .delete('/cart/items/SKU-001')
      .set('x-user-id', 'usr_1');

    expect(del.status).toBe(200);
    expect(del.body.items).toHaveLength(0);
    expect(del.body.total).toBe(0);
  });

  it('DELETE /cart clears entire cart', async () => {
    const app = buildTestApp();

    await request(app)
      .put('/cart/items/SKU-001')
      .set('x-user-id', 'usr_1')
      .send({ name: 'Ripiano', unitPrice: 1990, quantity: 2 });

    const clear = await request(app).delete('/cart').set('x-user-id', 'usr_1');
    expect(clear.status).toBe(204);

    const get = await request(app).get('/cart').set('x-user-id', 'usr_1');
    expect(get.status).toBe(200);
    expect(get.body.items).toHaveLength(0);
  });
});
