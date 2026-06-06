import { UpsertCartItem } from '../../src/useCases/UpsertCartItem';
import { FakeCartRepository } from '../helpers/fakes';

describe('UpsertCartItem', () => {
  it('adds a new item and computes total', async () => {
    const repo = new FakeCartRepository();
    const useCase = new UpsertCartItem(repo);

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
  });

  it('updates existing item quantity', async () => {
    const repo = new FakeCartRepository();
    const useCase = new UpsertCartItem(repo);

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
  });
});
