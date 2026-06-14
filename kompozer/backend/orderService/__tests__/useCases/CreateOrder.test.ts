import { CreateOrder } from '../../src/useCases/CreateOrder';
import { ValidationError } from '../../src/domain/entities/errors';
import { FakeOrderRepository } from '../helpers/fakes';

describe('CreateOrder', () => {
  it('creates an order in SUBMITTED status', async () => {
    const repo = new FakeOrderRepository();
    const createOrder = new CreateOrder(repo);

    const result = await createOrder.execute({
      userId: 'usr_1',
      items: [
        {
          sku: 'SKU-001',
          name: 'Ripiano',
          unitPrice: 1990,
          quantity: 2,
        },
      ],
      total: 3980,
    });

    expect(result.id).toEqual(expect.any(String));
    expect(result.status).toBe('SUBMITTED');
    expect(result.total).toBe(3980);
  });

  it('throws for empty items', async () => {
    const repo = new FakeOrderRepository();
    const createOrder = new CreateOrder(repo);

    await expect(
      createOrder.execute({
        userId: 'usr_1',
        items: [],
        total: 1000,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
