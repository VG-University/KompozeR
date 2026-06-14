export interface DailyOrderTrendPoint {
  date: string;
  submitted: number;
  done: number;
  cancelled: number;
  totalOrders: number;
  revenue: number;
}

export interface OrderTrendReader {
  fetchDaily(fromInclusive: Date, toInclusive: Date): Promise<DailyOrderTrendPoint[]>;
}
