/**
 * Unit tests for HandleCatalogEvent use case.
 */
import { HandleCatalogEvent } from '../../src/useCases/HandleCatalogEvent';
import {
  FakeBroadcaster,
  FakeIdGenerator,
  FakeImpactResolver,
  FakeNotificationRepository,
  FakeProcessedEventRepository,
} from '../helpers/fakes';

describe('HandleCatalogEvent', () => {
  it('creates notifications for impacted users and pushes realtime', async () => {
    const repo = new FakeNotificationRepository();
    const processed = new FakeProcessedEventRepository();
    const impact = new FakeImpactResolver();
    const broadcaster = new FakeBroadcaster();
    const ids = new FakeIdGenerator();

    impact.impacts = [
      { userId: 'usr_1', contextType: 'CART', contextId: 'cart_1' },
      { userId: 'usr_2', contextType: 'CAD', contextId: 'cfg_2' },
    ];

    const uc = new HandleCatalogEvent(repo, processed, impact, broadcaster, ids);

    const created = await uc.execute({
      type: 'PRICE_CHANGED',
      eventId: 'evt-1',
      occurredAt: new Date().toISOString(),
      componentId: 'cmp_1',
      sku: 'SKU-500',
      changedBy: 'admin',
      oldPrice: 1000,
      newPrice: 1200,
    });

    expect(created).toBe(2);
    expect(repo.notifications).toHaveLength(2);
    expect(broadcaster.pushed).toHaveLength(2);
    expect(repo.notifications[0].type).toBe('PRICE_CHANGED');
  });

  it('is idempotent by eventId', async () => {
    const repo = new FakeNotificationRepository();
    const processed = new FakeProcessedEventRepository();
    const impact = new FakeImpactResolver();
    const broadcaster = new FakeBroadcaster();
    const ids = new FakeIdGenerator();

    impact.impacts = [{ userId: 'usr_1', contextType: 'SUBSCRIPTION', contextId: 'sub_1' }];

    const uc = new HandleCatalogEvent(repo, processed, impact, broadcaster, ids);
    const event = {
      type: 'AVAILABILITY_CHANGED' as const,
      eventId: 'evt-2',
      occurredAt: new Date().toISOString(),
      componentId: 'cmp_2',
      sku: 'SKU-600',
      changedBy: 'admin',
      oldIsAvailable: true,
      newIsAvailable: false,
    };

    const first = await uc.execute(event);
    const second = await uc.execute(event);

    expect(first).toBe(1);
    expect(second).toBe(0);
    expect(repo.notifications).toHaveLength(1);
    expect(broadcaster.pushed).toHaveLength(1);
  });
});
