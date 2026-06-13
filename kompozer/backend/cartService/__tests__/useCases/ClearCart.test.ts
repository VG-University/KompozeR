import { ClearCart } from '../../src/useCases/ClearCart';
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import { FakeCartEventPublisher, FakeCartRepository } from '../helpers/fakes';

describe('ClearCart', () => {
  it('publishes CartUpdatedFromConfiguration when cart is cleared', async () => {
    const repo = new FakeCartRepository();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo, publisher);
    const clear = new ClearCart(repo, publisher);

    await upsert.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 1,
    });

    await clear.execute({ userId: 'usr_1' });

    expect(publisher.events.map((event) => event.type)).toContain('CartUpdatedFromConfiguration');
  });
});
