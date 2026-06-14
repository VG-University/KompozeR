import { CheckoutCart } from '../../src/useCases/CheckoutCart';
import {
  CartEmptyError,
  CartItemPriceChangedError,
  CartItemUnavailableError,
} from '../../src/domain/entities/errors';
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import {
  FakeCartEventPublisher,
  FakeCartRepository,
  FakeCatalogSnapshotProvider,
  FakeOrderServiceClient,
} from '../helpers/fakes';

describe('CheckoutCart', () => {
  it('confirms checkout when catalog snapshot matches cart', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const orderClient = new FakeOrderServiceClient();
    const publisher = new FakeCartEventPublisher();
    const upsert = new UpsertCartItem(repo, publisher);
    const checkout = new CheckoutCart(repo, catalog, orderClient, publisher);

    await upsert.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 2,
    });

    catalog.set({ sku: 'SKU-001', unitPrice: 1990, isAvailable: true });

    const result = await checkout.execute({ userId: 'usr_1' });
    expect(result.status).toBe('SUBMITTED');
    expect(result.orderId).toBe('ord_1');
    expect(result.total).toBe(3980);
    expect(orderClient.calls).toHaveLength(1);
    expect(publisher.events.map((event) => event.type)).toContain('OrderRequestSubmitted');
    expect(publisher.events.map((event) => event.type)).toContain('OrderConfirmationRequested');
  });

  it('throws CartEmptyError when cart has no items', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const orderClient = new FakeOrderServiceClient();
    const checkout = new CheckoutCart(repo, catalog, orderClient);

    await expect(checkout.execute({ userId: 'usr_1' })).rejects.toBeInstanceOf(CartEmptyError);
  });

  it('throws CartItemUnavailableError when item is unavailable', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const orderClient = new FakeOrderServiceClient();
    const upsert = new UpsertCartItem(repo);
    const checkout = new CheckoutCart(repo, catalog, orderClient);

    await upsert.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 1,
    });

    catalog.set({ sku: 'SKU-001', unitPrice: 1990, isAvailable: false });

    await expect(checkout.execute({ userId: 'usr_1' })).rejects.toBeInstanceOf(CartItemUnavailableError);
  });

  it('throws CartItemPriceChangedError when price changed', async () => {
    const repo = new FakeCartRepository();
    const catalog = new FakeCatalogSnapshotProvider();
    const orderClient = new FakeOrderServiceClient();
    const upsert = new UpsertCartItem(repo);
    const checkout = new CheckoutCart(repo, catalog, orderClient);

    await upsert.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 1,
    });

    catalog.set({ sku: 'SKU-001', unitPrice: 2090, isAvailable: true });

    await expect(checkout.execute({ userId: 'usr_1' })).rejects.toBeInstanceOf(CartItemPriceChangedError);
  });
});
