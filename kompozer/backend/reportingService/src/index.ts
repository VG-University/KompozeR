import mongoose from 'mongoose';
import { buildApp } from './app';

const PORT = Number(process.env['REPORTING_PORT'] ?? process.env['PORT']) || 3007;
const MONGO_URI =
  process.env['REPORTING_MONGO_URI'] ??
  process.env['ORDER_MONGO_URI'] ??
  process.env['MONGO_URI'] ??
  'mongodb://localhost:27017/kompozer-order';

const app = buildApp();

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[reporting] MongoDB connected: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[reporting] Listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[reporting] Failed to connect to MongoDB', err);
    process.exit(1);
  });
