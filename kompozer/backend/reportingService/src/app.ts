import cors from 'cors';
import express from 'express';
import { buildReportingRouter } from './adapters/http/reportingRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';
import { MongoOrderTrendReader } from './adapters/persistence/MongoOrderTrendReader';
import { OrderTrendReader } from './domain/ports/OrderTrendReader';
import { GetOrderTrend } from './useCases/GetOrderTrend';

/** Optional overrides for reporting service wiring. */
export interface BuildAppDeps {
  trendReader?: OrderTrendReader;
}

/** Builds the Express application for reporting endpoints. */
export function buildApp(deps: BuildAppDeps = {}) {
  const trendReader = deps.trendReader ?? new MongoOrderTrendReader();
  const getOrderTrend = new GetOrderTrend(trendReader);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/reports', buildReportingRouter({ getOrderTrend }));
  app.use(errorMiddleware);

  return app;
}
