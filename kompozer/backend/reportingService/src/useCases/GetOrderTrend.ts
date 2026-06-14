import { ValidationError } from '../domain/entities/errors';
import { DailyOrderTrendPoint, OrderTrendReader } from '../domain/ports/OrderTrendReader';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAYS = 7;
const MAX_DAYS = 90;

export interface GetOrderTrendInput {
  from?: string;
  to?: string;
}

export interface GetOrderTrendOutput {
  from: string;
  to: string;
  days: number;
  totals: {
    submitted: number;
    done: number;
    cancelled: number;
    totalOrders: number;
    totalRevenue: number;
  };
  points: DailyOrderTrendPoint[];
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseIsoDay(raw: string, fieldName: 'from' | 'to'): Date {
  if (!ISO_DAY.test(raw)) {
    throw new ValidationError(`${fieldName} must be in YYYY-MM-DD format`);
  }

  const parsed = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} is invalid`);
  }

  return parsed;
}

function enumerateDays(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    days.push(toIsoDay(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export class GetOrderTrend {
  constructor(private readonly reader: OrderTrendReader) {}

  async execute(input: GetOrderTrendInput): Promise<GetOrderTrendOutput> {
    const hasFrom = typeof input.from === 'string';
    const hasTo = typeof input.to === 'string';

    if (hasFrom !== hasTo) {
      throw new ValidationError('from and to must be provided together');
    }

    let fromDate: Date;
    let toDate: Date;

    if (hasFrom && hasTo) {
      fromDate = parseIsoDay(input.from as string, 'from');
      toDate = parseIsoDay(input.to as string, 'to');
    } else {
      toDate = new Date();
      toDate.setUTCHours(0, 0, 0, 0);
      fromDate = new Date(toDate.getTime() - (DEFAULT_DAYS - 1) * DAY_MS);
    }

    if (fromDate > toDate) {
      throw new ValidationError('from must be <= to');
    }

    const days = Math.floor((toDate.getTime() - fromDate.getTime()) / DAY_MS) + 1;
    if (days > MAX_DAYS) {
      throw new ValidationError(`date range too large (max ${MAX_DAYS} days)`);
    }

    const rawPoints = await this.reader.fetchDaily(fromDate, toDate);
    const pointsByDate = new Map(rawPoints.map((point) => [point.date, point]));

    const points = enumerateDays(fromDate, toDate).map((date) => {
      const point = pointsByDate.get(date);
      if (point) {
        return point;
      }

      return {
        date,
        submitted: 0,
        done: 0,
        cancelled: 0,
        totalOrders: 0,
        revenue: 0,
      };
    });

    const totals = points.reduce(
      (acc, point) => {
        acc.submitted += point.submitted;
        acc.done += point.done;
        acc.cancelled += point.cancelled;
        acc.totalOrders += point.totalOrders;
        acc.totalRevenue += point.revenue;
        return acc;
      },
      { submitted: 0, done: 0, cancelled: 0, totalOrders: 0, totalRevenue: 0 },
    );

    return {
      from: toIsoDay(fromDate),
      to: toIsoDay(toDate),
      days,
      totals,
      points,
    };
  }
}
