import { DailyOrderTrendPoint, OrderTrendReader } from '../../domain/ports/OrderTrendReader';
import { OrderModel } from './schemas/orderSchema';

type TrendAggDoc = {
  _id: string;
  submitted: number;
  done: number;
  cancelled: number;
  totalOrders: number;
  revenue: number;
};

export class MongoOrderTrendReader implements OrderTrendReader {
  async fetchDaily(fromInclusive: Date, toInclusive: Date): Promise<DailyOrderTrendPoint[]> {
    const fromStart = new Date(fromInclusive);
    fromStart.setUTCHours(0, 0, 0, 0);

    const toEnd = new Date(toInclusive);
    toEnd.setUTCHours(23, 59, 59, 999);

    const docs = await OrderModel.aggregate<TrendAggDoc>([
      {
        $match: {
          submittedAt: {
            $gte: fromStart,
            $lte: toEnd,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$submittedAt',
            },
          },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'SUBMITTED'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
          totalOrders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    return docs.map((doc) => ({
      date: doc._id,
      submitted: doc.submitted,
      done: doc.done,
      cancelled: doc.cancelled,
      totalOrders: doc.totalOrders,
      revenue: doc.revenue,
    }));
  }
}
