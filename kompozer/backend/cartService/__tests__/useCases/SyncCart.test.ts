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

  it('removes item and fires event when item is no longer available', async () => {
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
  });

  it('removes item when catalog has no snapshot for the sku', async () => {
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

  it('handles mixed cart: one item updated, one removed, one unchanged', async () => {
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
    expect(result.items).toHaveLength(2);
    expect(result.removedSkus).toEqual(['SKU-RM']);
    expect(result.updatedSkus).toEqual(['SKU-UP']);

    const updated = result.items.find((i) => i.sku === 'SKU-UP');
    expect(updated?.unitPrice).toBe(900);
    expect(updated?.lineTotal).toBe(1800);

    expect(result.total).toBe(1000 + 1800);

    const eventTypes = publisher.events.map((e) => e.type);
    expect(eventTypes).toContain('CartItemsRemovedUnavailable');
    expect(eventTypes).toContain('CartPricesUpdated');
  });
});
