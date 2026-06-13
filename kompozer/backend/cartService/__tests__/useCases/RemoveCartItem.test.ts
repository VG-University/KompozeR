import { RemoveCartItem } from '../../src/useCases/RemoveCartItem';
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import { FakeCartEventPublisher, FakeCartRepository } from '../helpers/fakes';

describe('RemoveCartItem', () => {
  it('publishes ItemRemovedFromCart when an existing SKU is removed', async () => {
    const repo = new FakeCartRepository();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo, publisher);
    const remove = new RemoveCartItem(repo, publisher);

    await upsert.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 1,
    });

    await remove.execute({ userId: 'usr_1', sku: 'SKU-001' });

    expect(publisher.events.map((event) => event.type)).toContain('ItemRemovedFromCart');
  });

  it('does not publish ItemRemovedFromCart when SKU does not exist', async () => {
    const repo = new FakeCartRepository();
    const publisher = new FakeCartEventPublisher();
    const remove = new RemoveCartItem(repo, publisher);

    await remove.execute({ userId: 'usr_1', sku: 'SKU-404' });

    expect(publisher.events.map((event) => event.type)).not.toContain('ItemRemovedFromCart');
  });
});
