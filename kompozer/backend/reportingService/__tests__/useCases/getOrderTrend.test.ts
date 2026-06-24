import { DailyOrderTrendPoint, OrderTrendReader } from '../../src/domain/ports/OrderTrendReader';
import { ValidationError } from '../../src/domain/entities/errors';
import { GetOrderTrend } from '../../src/useCases/GetOrderTrend';

/** Unit tests for order trend aggregation and range validation. */
class FakeOrderTrendReader implements OrderTrendReader {
  constructor(private readonly points: DailyOrderTrendPoint[]) {}

  async fetchDaily(): Promise<DailyOrderTrendPoint[]> {
    return this.points;
  }
}

describe('GetOrderTrend', () => {
  it('fills missing days with zero values', async () => {
    const reader = new FakeOrderTrendReader([
      {
        date: '2026-06-01',
        submitted: 1,
        done: 1,
        cancelled: 0,
        totalOrders: 2,
        revenue: 42,
      },
      {
        date: '2026-06-03',
        submitted: 2,
        done: 0,
        cancelled: 1,
        totalOrders: 3,
        revenue: 100,
      },
    ]);

    const useCase = new GetOrderTrend(reader);
    const output = await useCase.execute({ from: '2026-06-01', to: '2026-06-03' });

    expect(output.days).toBe(3);
    expect(output.points).toHaveLength(3);
    expect(output.points[1]).toEqual({
      date: '2026-06-02',
      submitted: 0,
      done: 0,
      cancelled: 0,
      totalOrders: 0,
      revenue: 0,
    });
    expect(output.totals.totalOrders).toBe(5);
    expect(output.totals.totalRevenue).toBe(142);
  });

  it('throws validation error when only from is provided', async () => {
    const reader = new FakeOrderTrendReader([]);
    const useCase = new GetOrderTrend(reader);

    await expect(useCase.execute({ from: '2026-06-01' })).rejects.toBeInstanceOf(ValidationError);
  });
});
