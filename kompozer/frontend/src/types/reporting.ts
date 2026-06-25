/** Reporting contracts for trend charts and aggregate dashboard metrics. */
export interface DailyTrendPoint {
  date: string;
  submitted: number;
  done: number;
  cancelled: number;
  totalOrders: number;
  revenue: number;
}

export interface TrendTotals {
  submitted: number;
  done: number;
  cancelled: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface OrderTrendDto {
  from: string;
  to: string;
  days: number;
  totals: TrendTotals;
  points: DailyTrendPoint[];
}
