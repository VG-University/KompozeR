// index — Entry point del catalogService.
// Legge PORT, MONGO_URI e REDIS_URL dall'ambiente, si connette a MongoDB e avvia il server.
import mongoose from 'mongoose';
import { buildApp } from './app';

const PORT      = Number(process.env['PORT'])      || 3002;
const MONGO_URI = process.env['MONGO_URI']         || 'mongodb://localhost:27017/kompozer-catalog';
const REDIS_URL = process.env['REDIS_URL']         || '';

const app = buildApp({ redisUrl: REDIS_URL || undefined });

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[catalog] MongoDB connected: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[catalog] Listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[catalog] Failed to connect to MongoDB', err);
    process.exit(1);
  });
