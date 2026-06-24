/** A single daily trend point used by reporting charts and totals. */
export interface DailyOrderTrendPoint {
  date: string;
  submitted: number;
  done: number;
  cancelled: number;
  totalOrders: number;
  revenue: number;
}

/** Persistence/query contract for order trend aggregation. */
export interface OrderTrendReader {
  fetchDaily(fromInclusive: Date, toInclusive: Date): Promise<DailyOrderTrendPoint[]>;
}
