/**
 * Unit tests for notification subscription use cases.
 */
import { CreateSubscription } from '../../src/useCases/CreateSubscription';
import { DeleteSubscription } from '../../src/useCases/DeleteSubscription';
import { GetSubscription } from '../../src/useCases/GetSubscription';
import { ListSubscriptions } from '../../src/useCases/ListSubscriptions';
import { UpdateSubscription } from '../../src/useCases/UpdateSubscription';
import { ForbiddenError, SubscriptionNotFoundError } from '../../src/domain/entities/errors';
import { FakeNotificationRepository } from '../helpers/fakes';

describe('Subscription use cases', () => {
  it('creates and lists user subscriptions', async () => {
    const repo = new FakeNotificationRepository();
    const create = new CreateSubscription(repo);
    const list = new ListSubscriptions(repo);

    await create.execute({
      userId: 'usr_1',
      scope: 'PRODUCT',
      targetId: 'SKU-100',
      events: ['PRICE_CHANGED', 'AVAILABILITY_CHANGED'],
      channel: 'IN_APP',
    });

    const result = await list.execute({ userId: 'usr_1' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].targetId).toBe('SKU-100');
  });

  it('gets and updates a subscription', async () => {
    const repo = new FakeNotificationRepository();
    const create = new CreateSubscription(repo);
    const get = new GetSubscription(repo);
    const update = new UpdateSubscription(repo);

    const created = await create.execute({
      userId: 'usr_1',
      scope: 'PRODUCT',
      targetId: 'SKU-200',
      events: ['PRICE_CHANGED', 'AVAILABILITY_CHANGED'],
      channel: 'IN_APP',
    });

    const loaded = await get.execute({ userId: 'usr_1', subscriptionId: created.id });
    expect(loaded.targetId).toBe('SKU-200');

    const updated = await update.execute({
      userId: 'usr_1',
      subscriptionId: created.id,
      events: ['PRICE_CHANGED'],
      isActive: false,
    });

    expect(updated.events).toEqual(['PRICE_CHANGED']);
    expect(updated.isActive).toBe(false);
  });

  it('deactivates a subscription with delete use case', async () => {
    const repo = new FakeNotificationRepository();
    const create = new CreateSubscription(repo);
    const del = new DeleteSubscription(repo);
    const get = new GetSubscription(repo);

    const created = await create.execute({
      userId: 'usr_1',
      scope: 'PRODUCT',
      targetId: 'SKU-300',
      events: ['AVAILABILITY_CHANGED'],
      channel: 'IN_APP',
    });

    await del.execute({ userId: 'usr_1', subscriptionId: created.id });
    const loaded = await get.execute({ userId: 'usr_1', subscriptionId: created.id });
    expect(loaded.isActive).toBe(false);
  });

  it('rejects access to other user subscription', async () => {
    const repo = new FakeNotificationRepository();
    const create = new CreateSubscription(repo);
    const get = new GetSubscription(repo);

    const created = await create.execute({
      userId: 'usr_1',
      scope: 'PRODUCT',
      targetId: 'SKU-400',
      events: ['PRICE_CHANGED'],
      channel: 'IN_APP',
    });

    await expect(
      get.execute({ userId: 'usr_2', subscriptionId: created.id }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('throws on missing subscription', async () => {
    const repo = new FakeNotificationRepository();
    const del = new DeleteSubscription(repo);

    await expect(
      del.execute({ userId: 'usr_1', subscriptionId: 'missing-sub' }),
    ).rejects.toBeInstanceOf(SubscriptionNotFoundError);
  });

  it('upserts duplicate subscription by user and target', async () => {
    const repo = new FakeNotificationRepository();
    const create = new CreateSubscription(repo);
    const list = new ListSubscriptions(repo);

    await create.execute({
      userId: 'usr_1',
      scope: 'PRODUCT',
      targetId: 'SKU-500',
      events: ['AVAILABILITY_CHANGED'],
      channel: 'IN_APP',
    });

    await create.execute({
      userId: 'usr_1',
      scope: 'PRODUCT',
      targetId: 'SKU-500',
      events: ['PRICE_CHANGED', 'AVAILABILITY_CHANGED'],
      channel: 'IN_APP',
    });

    const result = await list.execute({ userId: 'usr_1' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].events).toEqual(['PRICE_CHANGED', 'AVAILABILITY_CHANGED']);
  });
});
