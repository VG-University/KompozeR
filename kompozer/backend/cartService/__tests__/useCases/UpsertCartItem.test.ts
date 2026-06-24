/**
 * Unit tests for UpsertCartItem use case.
 */
import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import { ValidationError } from '../../src/domain/entities/errors';
import { FakeCartEventPublisher, FakeCartRepository } from '../helpers/fakes';

describe('UpsertCartItem', () => {
  it('adds a new item and computes total', async () => {
    const repo = new FakeCartRepository();
    const publisher = new FakeCartEventPublisher();
    const useCase = new UpsertCartItem(repo, publisher);

    const cart = await useCase.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 2,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].lineTotal).toBe(3980);
    expect(cart.total).toBe(3980);
    expect(publisher.events.map((event) => event.type)).toEqual(['CartCreated', 'ItemAddedToCart']);
  });

  it('updates existing item quantity', async () => {
    const repo = new FakeCartRepository();
    const publisher = new FakeCartEventPublisher();
    const useCase = new UpsertCartItem(repo, publisher);

    await useCase.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 1,
    });

    const cart = await useCase.execute({
      userId: 'usr_1',
      sku: 'SKU-001',
      name: 'Ripiano',
      unitPrice: 1990,
      quantity: 3,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.total).toBe(5970);
    expect(publisher.events.map((event) => event.type)).toEqual(['CartCreated', 'ItemAddedToCart']);
  });

  it('throws ValidationError on non-positive quantity', async () => {
    const repo = new FakeCartRepository();
    const useCase = new UpsertCartItem(repo);

    await expect(
      useCase.execute({
        userId: 'usr_1',
        sku: 'SKU-001',
        name: 'Ripiano',
        unitPrice: 1990,
        quantity: 0,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError on negative unitPrice', async () => {
    const repo = new FakeCartRepository();
    const useCase = new UpsertCartItem(repo);

    await expect(
      useCase.execute({
        userId: 'usr_1',
        sku: 'SKU-001',
        name: 'Ripiano',
        unitPrice: -10,
        quantity: 1,
      }),
    ).rejects.toThrow(ValidationError);
  });
});
