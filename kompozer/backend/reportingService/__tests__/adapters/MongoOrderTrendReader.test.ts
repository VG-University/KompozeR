import { OrderModel } from '../../src/adapters/persistence/schemas/orderSchema';
import { MongoOrderTrendReader } from '../../src/adapters/persistence/MongoOrderTrendReader';

/** Adapter tests for the Mongo order trend reader aggregation pipeline. */
describe('MongoOrderTrendReader', () => {
  it('aggregates revenue excluding CANCELLED orders', async () => {
    const exec = jest.fn().mockResolvedValue([
      {
        _id: '2026-06-21',
        submitted: 1,
        done: 1,
        cancelled: 1,
        totalOrders: 3,
        revenue: 300,
      },
    ]);

    const aggregateSpy = jest
      .spyOn(OrderModel, 'aggregate')
      .mockReturnValue({ exec } as never);

    try {
      const reader = new MongoOrderTrendReader();
      const result = await reader.fetchDaily(new Date('2026-06-21T00:00:00.000Z'), new Date('2026-06-21T00:00:00.000Z'));

      expect(result).toEqual([
        {
          date: '2026-06-21',
          submitted: 1,
          done: 1,
          cancelled: 1,
          totalOrders: 3,
          revenue: 300,
        },
      ]);

      expect(aggregateSpy).toHaveBeenCalledTimes(1);
      const pipeline = aggregateSpy.mock.calls[0]?.[0] as unknown as Array<Record<string, unknown>>;
      const groupStage = pipeline.find((stage) => '$group' in stage) as { $group: Record<string, unknown> };

      expect(groupStage.$group['revenue']).toEqual({
        $sum: {
          $cond: [{ $ne: ['$status', 'CANCELLED'] }, '$total', 0],
        },
      });
    } finally {
      aggregateSpy.mockRestore();
    }
  });
});
