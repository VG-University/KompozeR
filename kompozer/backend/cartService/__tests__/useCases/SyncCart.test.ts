/**
 * Unit tests for SyncCart use case.
 */
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import { SyncCart } from '../../src/useCases/SyncCart';
import {
  FakeCartEventPublisher,
  FakeCartRepository,
  FakeCatalogSnapshotProvider,
} from '../helpers/fakes';

describe('SyncCart', () => {
  it('returns empty cart when user has no cart', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const sync = new SyncCart(repo, catalog);

    const result = await sync.execute({ userId: 'usr_1' });
    expect(result.items).toHaveLength(0);
    expect(result.removedSkus).toHaveLength(0);
    expect(result.updatedSkus).toHaveLength(0);
  });

  it('returns cart unchanged when all prices match and items are available', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-A', name: 'Ripiano', unitPrice: 1990, quantity: 2 });
    catalog.set({ sku: 'SKU-A', unitPrice: 1990, isAvailable: true });

    const result = await sync.execute({ userId: 'usr_1' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].unitPrice).toBe(1990);
    expect(result.removedSkus).toHaveLength(0);
    expect(result.updatedSkus).toHaveLength(0);
  });

  it('updates the price and lineTotal when catalog price has changed', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog, publisher);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-A', name: 'Ripiano', unitPrice: 1990, quantity: 3 });
    catalog.set({ sku: 'SKU-A', unitPrice: 2200, isAvailable: true });

    const result = await sync.execute({ userId: 'usr_1' });
    expect(result.updatedSkus).toContain('SKU-A');
    expect(result.items[0].unitPrice).toBe(2200);
    expect(result.items[0].lineTotal).toBe(2200 * 3);
    expect(result.total).toBe(2200 * 3);
    expect(publisher.events.map((e) => e.type)).toContain('CartPricesUpdated');
  });

  it('clears entire cart and snapshots all items when any item becomes unavailable', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog, publisher);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-GONE', name: 'Prodotto rimosso', unitPrice: 500, quantity: 1 });
    catalog.set({ sku: 'SKU-GONE', unitPrice: 500, isAvailable: false });

    const result = await sync.execute({ userId: 'usr_1' });
    expect(result.removedSkus).toContain('SKU-GONE');
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(publisher.events.map((e) => e.type)).toContain('CartItemsRemovedUnavailable');

    const persisted = await repo.findByUserId('usr_1');
    expect(persisted?.removedUnavailableItems?.['SKU-GONE']).toBeDefined();
    expect(persisted?.removedUnavailableItems?.['SKU-GONE'].quantity).toBe(1);
  });

  it('clears entire cart including available items when one item becomes unavailable', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog, publisher);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-OK', name: 'Disponibile', unitPrice: 1000, quantity: 2 });
    await upsert.execute({ userId: 'usr_1', sku: 'SKU-GONE', name: 'Rimosso', unitPrice: 500, quantity: 3 });

    catalog.set({ sku: 'SKU-OK', unitPrice: 1000, isAvailable: true });
    catalog.set({ sku: 'SKU-GONE', unitPrice: 500, isAvailable: false });

    const result = await sync.execute({ userId: 'usr_1' });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.removedSkus).toEqual(expect.arrayContaining(['SKU-OK', 'SKU-GONE']));
    expect(result.updatedSkus).toHaveLength(0);

    const persisted = await repo.findByUserId('usr_1');
    expect(persisted?.removedUnavailableItems?.['SKU-OK']).toBeDefined();
    expect(persisted?.removedUnavailableItems?.['SKU-OK'].quantity).toBe(2);
    expect(persisted?.removedUnavailableItems?.['SKU-GONE']).toBeDefined();
    expect(persisted?.removedUnavailableItems?.['SKU-GONE'].quantity).toBe(3);
  });

  it('clears entire cart when catalog has no snapshot for a sku', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-MISSING', name: 'Fantasma', unitPrice: 100, quantity: 1 });
    // no catalog entry for SKU-MISSING

    const result = await sync.execute({ userId: 'usr_1' });
    expect(result.removedSkus).toContain('SKU-MISSING');
    expect(result.items).toHaveLength(0);
  });

  it('clears entire cart when any item is unavailable, regardless of other items', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo);
    const sync = new SyncCart(repo, catalog, publisher);

    await upsert.execute({ userId: 'usr_1', sku: 'SKU-OK', name: 'Stabile', unitPrice: 1000, quantity: 1 });
    await upsert.execute({ userId: 'usr_1', sku: 'SKU-UP', name: 'Aggiornato', unitPrice: 800, quantity: 2 });
    await upsert.execute({ userId: 'usr_1', sku: 'SKU-RM', name: 'Rimosso', unitPrice: 500, quantity: 1 });

    catalog.set({ sku: 'SKU-OK', unitPrice: 1000, isAvailable: true });
    catalog.set({ sku: 'SKU-UP', unitPrice: 900, isAvailable: true });
    catalog.set({ sku: 'SKU-RM', unitPrice: 500, isAvailable: false });

    const result = await sync.execute({ userId: 'usr_1' });

    // Entire cart cleared because SKU-RM is unavailable.
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.removedSkus).toEqual(expect.arrayContaining(['SKU-OK', 'SKU-UP', 'SKU-RM']));
    expect(result.updatedSkus).toHaveLength(0);

    // All items snapshotted for restore.
    const persisted = await repo.findByUserId('usr_1');
    expect(persisted?.removedUnavailableItems?.['SKU-OK']).toBeDefined();
    expect(persisted?.removedUnavailableItems?.['SKU-UP']).toBeDefined();
    expect(persisted?.removedUnavailableItems?.['SKU-RM']).toBeDefined();

    const eventTypes = publisher.events.map((e) => e.type);
    expect(eventTypes).toContain('CartItemsRemovedUnavailable');
    expect(eventTypes).not.toContain('CartPricesUpdated');
  });
});
