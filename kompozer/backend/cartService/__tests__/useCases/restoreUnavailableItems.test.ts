/**
 * Unit tests for RestoreUnavailableItems use case.
 */
import { RestoreUnavailableItems } from '../../src/useCases/RestoreUnavailableItems';
import { SyncCart } from '../../src/useCases/SyncCart';
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import {
  FakeCartEventPublisher,
  FakeCartRepository,
  FakeCatalogSnapshotProvider,
} from '../helpers/fakes';

describe('RestoreUnavailableItems', () => {
  it('restores all previously cleared items when availability returns', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog, publisher);
    const restore = new RestoreUnavailableItems(repo, catalog, publisher);

    // Cart with two items: one will become unavailable, triggering full clear.
    await upsert.execute({ userId: 'usr_1', sku: 'SKU-A', name: 'Ripiano A', unitPrice: 1000, quantity: 2 });
    await upsert.execute({ userId: 'usr_1', sku: 'SKU-RESTORE', name: 'Montante', unitPrice: 1200, quantity: 3 });

    catalog.set({ sku: 'SKU-A', unitPrice: 1000, isAvailable: true });
    catalog.set({ sku: 'SKU-RESTORE', unitPrice: 1200, isAvailable: false });
    await sync.execute({ userId: 'usr_1' });

    // Both SKUs become available (with updated price for SKU-RESTORE).
    catalog.set({ sku: 'SKU-A', unitPrice: 1000, isAvailable: true });
    catalog.set({ sku: 'SKU-RESTORE', unitPrice: 1500, isAvailable: true });

    const restoredUsers = await restore.execute({ sku: 'SKU-RESTORE' });
    expect(restoredUsers).toBe(1);

    const cart = await repo.findByUserId('usr_1');
    expect(cart?.items).toHaveLength(2);

    const skuA = cart?.items.find((i) => i.sku === 'SKU-A');
    expect(skuA?.quantity).toBe(2);
    expect(skuA?.unitPrice).toBe(1000);

    const skuR = cart?.items.find((i) => i.sku === 'SKU-RESTORE');
    expect(skuR?.quantity).toBe(3);
    expect(skuR?.unitPrice).toBe(1500); // fresh price from catalog

    expect(cart?.removedUnavailableItems?.['SKU-A']).toBeUndefined();
    expect(cart?.removedUnavailableItems?.['SKU-RESTORE']).toBeUndefined();

    const restoreEvents = publisher.events.filter((e) => e.type === 'CartItemsRestoredAvailable');
    expect(restoreEvents).toHaveLength(1);
    expect(restoreEvents[0].restoredSkus).toEqual(expect.arrayContaining(['SKU-A', 'SKU-RESTORE']));
  });

  it('only restores items that are currently available in catalog', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog, publisher);
    const restore = new RestoreUnavailableItems(repo, catalog, publisher);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-BACK', name: 'Torna', unitPrice: 500, quantity: 1 });
    await upsert.execute({ userId: 'usr_1', sku: 'SKU-STILL-OUT', name: 'Ancora fuori', unitPrice: 800, quantity: 2 });

    catalog.set({ sku: 'SKU-BACK', unitPrice: 500, isAvailable: false });
    catalog.set({ sku: 'SKU-STILL-OUT', unitPrice: 800, isAvailable: false });
    await sync.execute({ userId: 'usr_1' });

    // Only SKU-BACK becomes available again.
    catalog.set({ sku: 'SKU-BACK', unitPrice: 500, isAvailable: true });

    await restore.execute({ sku: 'SKU-BACK' });

    const cart = await repo.findByUserId('usr_1');
    expect(cart?.items).toHaveLength(1);
    expect(cart?.items[0].sku).toBe('SKU-BACK');
    // SKU-STILL-OUT remains in snapshot.
    expect(cart?.removedUnavailableItems?.['SKU-STILL-OUT']).toBeDefined();
  });

  it('does nothing when triggering sku is still unavailable', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const restore = new RestoreUnavailableItems(repo, catalog);

    const restoredUsers = await restore.execute({ sku: 'SKU-X' });
    expect(restoredUsers).toBe(0);
  });
});
