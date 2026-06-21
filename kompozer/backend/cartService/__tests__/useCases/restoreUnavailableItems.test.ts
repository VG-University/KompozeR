import { RestoreUnavailableItems } from '../../src/useCases/RestoreUnavailableItems';
import { SyncCart } from '../../src/useCases/SyncCart';
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import {
  FakeCartEventPublisher,
  FakeCartRepository,
  FakeCatalogSnapshotProvider,
} from '../helpers/fakes';

describe('RestoreUnavailableItems', () => {
  it('restores previously removed quantity when availability returns', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog, publisher);
    const restore = new RestoreUnavailableItems(repo, catalog, publisher);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-RESTORE', name: 'Ripiano', unitPrice: 1000, quantity: 3 });
    catalog.set({ sku: 'SKU-RESTORE', unitPrice: 1000, isAvailable: false });
    await sync.execute({ userId: 'usr_1' });

    catalog.set({ sku: 'SKU-RESTORE', unitPrice: 1200, isAvailable: true });
    const restoredUsers = await restore.execute({ sku: 'SKU-RESTORE' });

    expect(restoredUsers).toBe(1);

    const cart = await repo.findByUserId('usr_1');
    expect(cart?.items).toHaveLength(1);
    expect(cart?.items[0].sku).toBe('SKU-RESTORE');
    expect(cart?.items[0].quantity).toBe(3);
    expect(cart?.items[0].unitPrice).toBe(1200);
    expect(cart?.removedUnavailableItems?.['SKU-RESTORE']).toBeUndefined();
    expect(publisher.events.map((e) => e.type)).toContain('CartItemsRestoredAvailable');
  });

  it('does nothing when sku is still unavailable', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const restore = new RestoreUnavailableItems(repo, catalog);

    const restoredUsers = await restore.execute({ sku: 'SKU-X' });
    expect(restoredUsers).toBe(0);
  });
});
